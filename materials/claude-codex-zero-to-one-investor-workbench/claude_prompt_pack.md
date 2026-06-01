# Claude Prompt Pack

## 1. Research Question Generator

```text
Context:
I am a non-code investor researching [ASSET/THEME]. I do not want a buy/sell recommendation.

Task:
Help me turn this investment idea into research questions.

Constraints:
- Separate business / macro / valuation / catalyst / risk / red flag questions.
- Do not make unsupported claims.
- Mark assumptions clearly.

Output format:
Return a table with columns: Category, Research question, Why it matters, Evidence needed.
```

## 2. Source Review

```text
Context:
I will paste a source related to [ASSET/THEME].

Task:
Extract only claims that are supported by the pasted source.

Constraints:
- Separate fact, interpretation, and assumption.
- Do not use outside knowledge unless I ask.
- Highlight missing data and stale data.

Output format:
Return:
1. Source summary
2. Evidence table
3. Claims to verify
4. Red flags
```

## 3. Thesis Card Builder

```text
Context:
Use my research question map and source log below.

Task:
Draft an investor thesis card.

Constraints:
- Include bull case, bear case, key metric, risks, and kill criteria.
- Do not make a buy/sell recommendation.
- Every important claim must link to a source ID or be marked as assumption.

Output format:
Use the thesis card template.
```

## 4. Risk Review

```text
Context:
Here is my thesis card.

Task:
Act as a skeptical investment committee reviewer.

Constraints:
- Challenge weak evidence.
- Identify hidden assumptions.
- Suggest what data would change the thesis.
- Do not give financial advice.

Output format:
Return a review table: Issue, Why it matters, Severity, Next action.
```

## 5. Weekly Review

```text
Context:
Here is my watchlist and thesis cards.

Task:
Create a weekly review plan.

Constraints:
- Focus on what changed, what evidence is new, and what needs review.
- Do not generate buy/sell calls.

Output format:
Return: Top 3 review priorities, stale items, missing evidence, next actions.
```

