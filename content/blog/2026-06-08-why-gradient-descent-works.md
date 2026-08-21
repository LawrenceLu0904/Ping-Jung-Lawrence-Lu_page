---
title: "A One-Line Intuition for Gradient Descent"
date: "2026-06-08"
summary: "The gradient points uphill, so we step the other way. A short derivation of why that's the locally optimal move."
tags: ["math", "machine-learning", "optimization"]
draft: false
---

Gradient descent is usually introduced as a recipe: compute the gradient, step
against it, repeat. But there's a clean reason it's the *right* direction, and it
falls out of a first-order Taylor expansion.

## The setup

We want to minimize a differentiable function $f : \mathbb{R}^n \to \mathbb{R}$.
Near a point $x$, the function is approximately linear:

$$
f(x + \delta) \approx f(x) + \nabla f(x)^\top \delta
$$

We're free to pick the step $\delta$, but we constrain its size, $\lVert \delta \rVert = \eta$,
so the approximation stays valid. Which direction decreases $f$ the most?

## The one-line argument

The change in $f$ is $\nabla f(x)^\top \delta$. By Cauchy–Schwarz,

$$
\nabla f(x)^\top \delta \;\geq\; -\lVert \nabla f(x) \rVert \, \lVert \delta \rVert,
$$

with equality exactly when $\delta$ points *opposite* to the gradient. So the
steepest decrease is

$$
\delta = -\eta \, \frac{\nabla f(x)}{\lVert \nabla f(x) \rVert}.
$$

That's it — the gradient is the direction of steepest ascent, so its negation is
steepest descent. Everything else (learning-rate schedules, momentum, Adam) is a
refinement of this single step.

## In code

```python
import numpy as np

def gradient_descent(grad, x0, lr=0.1, steps=100):
    x = np.asarray(x0, dtype=float)
    for _ in range(steps):
        x -= lr * grad(x)
    return x

# Minimize f(x) = (x - 3)^2, whose gradient is 2*(x - 3).
x_min = gradient_descent(lambda x: 2 * (x - 3), x0=0.0)
print(round(float(x_min), 4))  # -> 3.0
```

> The constraint $\lVert \delta \rVert = \eta$ is doing quiet but important work:
> drop it and the linear model says you can decrease $f$ without bound, which is
> nonsense. The step size is what keeps the local picture honest.
