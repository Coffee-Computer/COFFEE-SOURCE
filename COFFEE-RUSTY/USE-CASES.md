# coffee.rusty — Use Cases

Rust execution via the Rust Playground API. Code runs remotely (requires network). These use cases show how rusty fits into the Coffee stack.

---

## 1. Learning Rust

**Flow:** In-browser Rust playground for tutorials, courses, or docs. No local install. Control saves scripts so learners can resume later.

**Example:** Code-along lessons, Rust by Example, ownership/borrowing experiments.

---

## 2. Algorithm Prototyping

**Flow:** User writes Rust snippets (sorting, parsing, data structures) → compile & run → see output. Good for systems-style logic without local toolchain.

**Example:** Implement binary search, parse CSV, benchmark ideas.

---

## 3. AI-Assisted Rust

**Flow:** `coffee.ai` generates Rust code → `coffee.rusty` compiles and runs it → output shown in UI or fed to que.

**Example:** "Write a Rust function to reverse a string" → AI returns code → rusty executes → user sees result.

---

## 4. Code Snippets / Snippets Library

**Flow:** Save and load Rust snippets via Control. Build a personal library of examples, one-liners, or templates.

**Example:** Reusable patterns (error handling, async, traits) stored and loaded on demand.

---

## 5. Documentation / Interactive Examples

**Flow:** Docs or tutorials embed rusty to run example code. Readers can edit and run without leaving the page.

**Example:** "Try it" buttons next to code blocks that execute via rusty.

---

## Snake vs Rusty

| | **coffee.snake** | **coffee.rusty** |
|---|------------------|------------------|
| **Runtime** | Pyodide (WASM, local) | Rust Playground API (remote) |
| **Network** | Not required | Required |
| **Offline** | Yes | No |
| **Init** | `await init()` | Ready immediately |
| **Use case** | Data, scripting, pipelines | Learning, algorithms, systems-style |

---

## Stack Summary

| Layer | Module | Role |
|-------|--------|------|
| **UI** | coffee.button, input, etc. | Screens, forms, layout |
| **Data** | coffee.que + wire | Local document store + persistence |
| **Compute (Python)** | coffee.snake | Local Python (WASM) |
| **Compute (Rust)** | coffee.rusty | Remote Rust (Playground API) |
| **Network** | coffee.request | HTTP, APIs |
