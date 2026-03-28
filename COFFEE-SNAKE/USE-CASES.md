# coffee.snake — Use Cases

Python execution in the browser via Pyodide. These use cases show how snake fits into the Coffee stack.

---

## 1. Data Processing Pipeline

**Flow:** `coffee.request` → fetch JSON/CSV from an API → Python processes it (filter, transform, aggregate) → `coffee.que` stores results for the UI.

**Example:** Fetch product prices → Python computes averages, min/max → que holds results for display.

---

## 2. Learning / Playground

**Flow:** In-browser Python for tutorials, courses, or docs. No install. Control saves scripts so learners can resume later.

**Example:** Code-along lessons, interactive Python docs, sandbox for experimentation.

---

## 3. Formulas / Calculators

**Flow:** User enters expressions or small scripts → Python evaluates → results shown in Coffee UI.

**Example:** Loan calculator, unit converter, custom math, spreadsheet-style formulas.

---

## 4. AI-Assisted Code

**Flow:** `coffee.ai` generates Python snippets → `coffee.snake` runs them → output goes to que, Drive, or UI.

**Example:** "Write a script to parse this JSON" → AI returns Python → snake executes → user sees results.

---

## 5. Data Science / Visualization Prep

**Flow:** Python does numeric work (stats, transforms) → results passed to `coffee.pix` or `coffee.svg` for charts, or `coffee.draw` for canvas plots.

**Example:** Compute histogram bins in Python → render bar chart with draw/svg.

---

## 6. Automation / Scripting

**Flow:** User writes small scripts (batch rename, format conversion, text processing) → snake runs on data from que or request → results written back to que or Control.

**Example:** "Convert this CSV to JSON" → Python script → output into que.

---

## 7. Que + Snake Integration

**Flow:** Python outputs structured data (list of dicts) → `q.add()` each item → full "fetch → process → store" pipeline without a server.

**Example:** Fetch API → Python filters/transforms → push each record into que → UI lists them.

---

## Stack Summary

| Layer   | Module        | Role                          |
|---------|---------------|-------------------------------|
| **UI**  | coffee.button, input, etc. | Screens, forms, layout |
| **Data**| coffee.que + wire | Local document store + persistence |
| **Compute** | coffee.snake | Python execution (transform, analyze) |
| **Network** | coffee.request | HTTP, APIs, fetch data |

---

## Next Steps

- **Request → Snake → Que demo** — Fetch JSON, process in Python, push into que, display in UI. Shows the full stack in one flow.
