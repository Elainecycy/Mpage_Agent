# 测试题库 v0（任务 1.11）

对应[迭代计划](../../docs/development-iteration-plan.md) 1.11：20~30 道「描述 + 素材 → 应生成什么结构」的标准题 + 一键批量跑分，量化 AI 生成质量。判分口径见[开工决议 §8](../../docs/phase1-kickoff-decisions.md)。

## 文件

| 文件 | 作用 |
|------|------|
| `cases.json` | 24 道标准题：每题含 `user_prompt` + `asset_manifest` + `expect` 标注 |
| `scorer.py` | **纯函数判分器**（不调模型）：把生成结果按标注打分 + 汇总指标。可单测 |
| `run_eval.py` | 跑批入口：逐题调生成服务 → 判分 → 汇总 → 落 CSV |
| `results.csv` | 最近一次跑批明细（不含密钥） |
| `outputs/` | `--dump` 时每题生成的页面 JSON（已 gitignore，不入库） |

## 标注与判分口径（决议 §8）

每题 `expect` 里：

```jsonc
{
  "min_chapters": 2, "max_chapters": 2,     // 章节数区间
  "card_slots": [                            // 卡片选对：按(第几章, 第几卡)定位 → 可接受类型集合
    { "chapter": 0, "card": 0, "accept": ["BackgroundTextCard"] },
    { "chapter": 1, "card": 0, "accept": ["IconCard"] }
  ],
  "expected_assets": ["https://.../gift.png"],   // 素材命中：这些 url 应被页面用上
  "must_contain_texts": ["活动规则……"]           // 文案保真：必须原样进 data.texts
}
```

- **Schema 合格率** = 产出通过两层校验页面的题数 / 总题数（含自愈重试后）。
- **卡片选对率** = 命中槽位 / 标注槽位（**仅在合格题上统计**——无效页面无法评判内容）。
- **素材命中率** = 命中素材 / 应命中素材（仅合格题）。
- **文案保真率**（附加）= 原样保留的文案 / 标注文案（仅合格题）。

> 内容三项只在「合格题」上算分母：失败题先体现在合格率里，不重复惩罚。

## 跑批

```bash
cd agent_service
# 先在 .env 配好公司模型网关与密钥（MPAGE_LLM_BASE_URL / MPAGE_LLM_API_KEY）
.venv/bin/python -m eval.run_eval            # 全部 24 题
.venv/bin/python -m eval.run_eval --limit 3  # 只跑前 3 题（省调用）
.venv/bin/python -m eval.run_eval --dump     # 同时把每题生成结果落到 outputs/
```

退出码：0 = 三项核心指标全达标，1 = 未达标（便于接 CI）。判分逻辑本身有单测：
`tests/unit/test_eval_scorer.py`（不依赖真模型）。

## 最近一次结果（qwen-plus，2026-06-14）

| 指标 | 目标 | 实测 |
|------|------|------|
| Schema 合格率 | ≥ 98% | **100%（24/24）** |
| 卡片选对率 | > 90% | **100%（62/62 槽位）** |
| 素材命中率 | ≥ 80% | **100%（52/52）** |
| 文案保真率 | — | **100%（46/46）** |
| 平均调用次数 | — | **1.12**（24 题中 3 题靠自愈重试一次救回） |

3 道题首轮输出有瑕疵（path 写成 `/texts.x`、description 给了 null），**自愈重试回灌错误后第二轮全部改对**——没有重试，合格率会降到 87.5%。这是重试机制在真实模型上的价值验证。

> 题库为 v0；后续可按第 2/3 期需要扩充看图题、修改题（迭代计划 2.8 / 3.7）。
