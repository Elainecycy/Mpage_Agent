"""测试题库跑批入口（任务 1.11）：对每题调生成服务、判分、汇总并落 CSV。

用法（需先在 .env 配好模型网关与密钥）：

    .venv/bin/python -m eval.run_eval                 # 跑全部题
    .venv/bin/python -m eval.run_eval --limit 3       # 只跑前 3 题(省调用)
    .venv/bin/python -m eval.run_eval --dump          # 同时把每题生成的页面 JSON 落到 eval/outputs/

输出：终端逐题进度 + 汇总指标（合格率/卡片选对率/素材命中率/文案保真率），明细写 eval/results.csv。
退出码 0=三项核心指标全达标，1=未达标，便于接 CI。**结果文件不含任何密钥**。
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import time
from pathlib import Path

from app.errors import AppError
from app.services.generator import generate_page_json
from eval.scorer import CaseScore, aggregate, score_case

_HERE = Path(__file__).parent


def load_cases(path: str) -> list[dict]:
    """读取题库 JSON。

    Args:
        path: 题库文件路径。

    Returns:
        题目列表。
    """
    return json.loads(Path(path).read_text(encoding="utf-8"))


def run_one(case: dict, dump_dir: Path | None) -> tuple[CaseScore, float]:
    """跑一题：调生成服务 → 判分；可选落生成结果。

    大致逻辑：计时调用 ``generate_page_json``，成功取页面与调用次数、失败捕获 ``AppError``
    记错误码 → 交 ``score_case`` 打分 → 需要时把页面 JSON 落盘备查。

    Args:
        case: 单题。
        dump_dir: 若非 None，把成功生成的页面写到该目录。

    Returns:
        ``(该题得分, 端到端耗时秒)``。
    """
    started = time.perf_counter()
    page, code, attempts = None, None, 0
    try:
        result = generate_page_json(case["user_prompt"], case["asset_manifest"])
        page, attempts = result.page_json, result.attempts
    except AppError as exc:
        code = exc.code.value
        if isinstance(exc.details, dict):
            attempts = exc.details.get("attempts", 0)
    latency = time.perf_counter() - started

    score = score_case(case, page, error_code=code, attempts=attempts)
    if dump_dir is not None and page is not None:
        dump_dir.mkdir(parents=True, exist_ok=True)
        (dump_dir / f"{score.case_id}.json").write_text(
            json.dumps(page, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    return score, latency


def main() -> None:
    """命令行入口：解析参数、跑批、打印汇总、写 CSV、按是否达标设退出码。"""
    parser = argparse.ArgumentParser(description="页面生成测试题库跑批")
    parser.add_argument("--cases", default=str(_HERE / "cases.json"), help="题库 JSON 路径")
    parser.add_argument("--limit", type=int, default=0, help="只跑前 N 题（0=全部）")
    parser.add_argument("--out", default=str(_HERE / "results.csv"), help="明细 CSV 输出路径")
    parser.add_argument("--dump", action="store_true", help="把每题生成的页面落到 eval/outputs/")
    args = parser.parse_args()

    cases = load_cases(args.cases)
    if args.limit:
        cases = cases[: args.limit]
    dump_dir = _HERE / "outputs" if args.dump else None

    scores: list[CaseScore] = []
    rows: list[tuple] = []
    for case in cases:
        score, latency = run_one(case, dump_dir)
        scores.append(score)
        rows.append(
            (
                score.case_id, score.passed, score.error_code or "", score.attempts, f"{latency:.1f}",
                f"{score.card_correct}/{score.card_total}", f"{score.asset_hits}/{score.asset_total}",
                f"{score.text_hits}/{score.text_total}", score.chapter_count, "; ".join(score.notes[:4]),
            )
        )
        flag = "OK  " if score.passed else "FAIL"
        tail = f"  <{score.error_code}>" if score.error_code else ""
        print(
            f"[{flag}] {score.case_id:22} try={score.attempts} {latency:5.1f}s "
            f"card {score.card_correct}/{score.card_total} "
            f"asset {score.asset_hits}/{score.asset_total} "
            f"text {score.text_hits}/{score.text_total}{tail}"
        )

    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["case_id", "passed", "error_code", "attempts", "latency_s", "card", "asset", "text", "chapters", "notes"]
        )
        writer.writerows(rows)

    s = aggregate(scores)
    avg_try = s.total_attempts / s.total if s.total else 0.0
    print("\n===== 汇总 =====")
    print(f"题数          : {s.total}")
    print(f"Schema 合格率 : {s.pass_rate:6.1%}  ({s.passed}/{s.total})              目标 ≥98%")
    print(f"卡片选对率    : {s.card_rate:6.1%}  ({s.card_correct}/{s.card_total} 槽位, 仅合格题)  目标 >90%")
    print(f"素材命中率    : {s.asset_rate:6.1%}  ({s.asset_hits}/{s.asset_total}, 仅合格题)      目标 ≥80%")
    print(f"文案保真率    : {s.text_rate:6.1%}  ({s.text_hits}/{s.text_total}, 仅合格题)")
    print(f"平均调用次数  : {avg_try:.2f}   (1=首次即过, 2=自愈重试一次)")
    print(f"明细已写入    : {args.out}")

    met = s.pass_rate >= 0.98 and s.card_rate > 0.90 and s.asset_rate >= 0.80
    print("结论          :", "三项核心指标达标 ✅" if met else "未达标 ⚠️（见上方明细）")
    sys.exit(0 if met else 1)


if __name__ == "__main__":
    main()
