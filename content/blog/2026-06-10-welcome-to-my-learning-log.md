---
title: "Welcome to My Learning Log"
date: "2026-06-10"
summary: "Why I'm keeping a public notebook of the math and code ideas I find beautiful — and how this blog is set up."
tags: ["meta", "notes"]
draft: false
---

I read and build a lot of small things, and I keep losing the cleanest version of
an idea the moment I move on. This is my fix: a public notebook where I write down
the math and coding ideas I found genuinely interesting, in the simplest form I can.

The goal isn't to be comprehensive — it's to capture the *click* moment, the one
sentence that made something obvious.

## What you'll find here

- **Math** — proofs, identities, and the occasional "wait, that's why" moment.
- **Code** — algorithms, language quirks, and patterns worth remembering.

## Math renders natively

Inline math like $e^{i\pi} + 1 = 0$ works, and so do display equations:

$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}
\qquad
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Code is syntax-highlighted

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

That's the whole idea. New posts are just markdown files I drop into
`content/blog/` — write, commit, push, and it's live.
