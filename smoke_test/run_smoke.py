# 模型冒烟跑批（迭代 0 任务 0.3）
#
# 用法见 README.md。模型网关默认按 OpenAI 兼容接口调用（多数公司网关兼容），
# 环境变量配置：
#   SMOKE_BASE_URL  如 https://llm-gateway.your-company.com/v1
#   SMOKE_API_KEY   网关密钥
# 不兼容时只需改写 call_model() 一个函数。

import argparse
import csv
import json
import os
import re
import time
import urllib.request
from collections import Counter
from pathlib import Path

from smoke_check import smoke_check, case_checks, is_pass, fabricated_url_count

HERE = Path(__file__).parent


def build_user_message(case: dict) -> str:
    manifest = json.dumps(case["asset_manifest"], ensure_ascii=False, indent=2)
    return (
        "请根据以下需求生成页面 JSON。\n\n"
        f"【页面需求】\n{case['user_prompt']}\n\n"
        f"【素材清单】（图片只能从这里选）\n{manifest}\n"
    )


def call_model(model: str, system: str, user: str,
               temperature: float, json_mode: bool) -> str:
    """OpenAI 兼容的 /chat/completions 调用。换网关协议时只改这里。"""
    base_url = os.environ.get("SMOKE_BASE_URL")
    api_key = os.environ.get("SMOKE_API_KEY")
    if not base_url or not api_key:
        raise SystemExit("请先设置环境变量 SMOKE_BASE_URL 和 SMOKE_API_KEY")

    body = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    req = urllib.request.Request(
        base_url.rstrip("/") + "/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {api_key}"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def main():
    ap = argparse.ArgumentParser(description="页面生成模型冒烟跑批")
    ap.add_argument("--models", required=True, help="候选模型名，逗号分隔")
    ap.add_argument("--repeats", type=int, default=5, help="每个用例跑几次（默认 5）")
    ap.add_argument("--temperature", type=float, default=0.2)
    ap.add_argument("--json-mode", action="store_true", help="开启网关的 JSON mode")
    ap.add_argument("--cases", default=str(HERE / "cases.json"))
    ap.add_argument("--dry-run", action="store_true", help="只打印拼好的 prompt，不调模型")
    args = ap.parse_args()

    system_prompt = (HERE / "system_prompt.md").read_text(encoding="utf-8")
    cases = json.loads(Path(args.cases).read_text(encoding="utf-8"))
    models = [m.strip() for m in args.models.split(",") if m.strip()]

    if args.dry_run:
        print("===== SYSTEM PROMPT =====\n" + system_prompt)
        print("\n===== USER MESSAGE（以第一个用例为例）=====\n" + build_user_message(cases[0]))
        return

    out_dir = HERE / "outputs"
    out_dir.mkdir(exist_ok=True)
    results_path = HERE / "results.csv"
    rows = []

    for model in models:
        safe_model = re.sub(r"[^\w.-]", "_", model)
        for case in cases:
            manifest_urls = {a["url"] for a in case["asset_manifest"]}
            user_msg = build_user_message(case)
            for i in range(1, args.repeats + 1):
                t0 = time.time()
                try:
                    raw = call_model(model, system_prompt, user_msg,
                                     args.temperature, args.json_mode)
                    latency = round(time.time() - t0, 1)
                except Exception as e:
                    rows.append({"model": model, "case": case["id"], "attempt": i,
                                 "passed": False, "fabricated_url": 0,
                                 "latency_s": round(time.time() - t0, 1),
                                 "issues": f"FATAL: 调用失败 {e}"})
                    print(f"  {model} / {case['id']} #{i}: 调用失败 {e}")
                    continue

                # 原始输出落盘，便于人工复盘
                raw_file = out_dir / f"{safe_model}__{case['id']}__{i}.txt"
                raw_file.write_text(raw, encoding="utf-8")

                issues = smoke_check(raw, manifest_urls) + case_checks(raw, case)
                passed = is_pass(issues)
                rows.append({"model": model, "case": case["id"], "attempt": i,
                             "passed": passed,
                             "fabricated_url": fabricated_url_count(issues),
                             "latency_s": latency,
                             "issues": " | ".join(issues)})
                mark = "✅" if passed else "❌"
                print(f"  {model} / {case['id']} #{i}: {mark} "
                      f"({latency}s{'，' + '；'.join(issues[:2]) if issues else ''})")

    with open(results_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    # ---- 汇总 ----
    print(f"\n明细已写入 {results_path}，原始输出在 {out_dir}/\n")
    print(f"{'模型':<28}{'一次通过率':<12}{'编造URL':<10}{'平均延迟':<10}主要问题")
    for model in models:
        mrows = [r for r in rows if r["model"] == model]
        n_pass = sum(r["passed"] for r in mrows)
        n_fab = sum(r["fabricated_url"] for r in mrows)
        avg_lat = sum(r["latency_s"] for r in mrows) / max(len(mrows), 1)
        err_types = Counter()
        for r in mrows:
            for issue in r["issues"].split(" | "):
                if issue.startswith(("FATAL", "ERROR")):
                    err_types[issue.split(":")[1].strip()[:18]] += 1
        top = "; ".join(f"{k}×{v}" for k, v in err_types.most_common(3)) or "—"
        print(f"{model:<28}{n_pass}/{len(mrows):<10}{n_fab:<10}{avg_lat:<9.1f}s {top}")

    print("\n判读提醒：一次通过率 < 90% 的模型不建议作为默认；"
          "编造 URL 次数不为 0 的重点标记；"
          "若所有模型挂在同一类错误，先怀疑格式设计而非模型（回到任务 0.1）。")


if __name__ == "__main__":
    main()
