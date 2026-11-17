# Render rewrite rules for the blog

In the Render dashboard, open the static site that serves www.forgedsa.co.za, go to **Redirects/Rewrites**, and add these as **Rewrite** rules. Put them above the catch-all `/*` -> `/index.html` rule.

| # | Source | Destination | Type |
| --- | --- | --- | --- |
| 1 | `/blog` | `/blog.html` | Rewrite |
| 2 | `/blog/forged-wheel-basics` | `/blog/forged-wheel-basics.html` | Rewrite |
| 3 | `/blog/bmw-m-wheel-fitment` | `/blog/bmw-m-wheel-fitment.html` | Rewrite |
| 4 | `/blog/buying-forged-wheels-south-africa` | `/blog/buying-forged-wheels-south-africa.html` | Rewrite |
| 5 | `/blog/wheel-care` | `/blog/wheel-care.html` | Rewrite |
| 6 | `/blog/forged-wheel-basics/forged-vs-cast-vs-flow-formed-wheels` | `/blog/forged-wheel-basics/forged-vs-cast-vs-flow-formed-wheels.html` | Rewrite |
| 7 | `/blog/forged-wheel-basics/unsprung-weight-explained` | `/blog/forged-wheel-basics/unsprung-weight-explained.html` | Rewrite |
| 8 | `/blog/forged-wheel-basics/are-forged-wheels-worth-it` | `/blog/forged-wheel-basics/are-forged-wheels-worth-it.html` | Rewrite |
| 9 | `/blog/bmw-m-wheel-fitment/wheel-fitment-explained-pcd-offset-centre-bore` | `/blog/bmw-m-wheel-fitment/wheel-fitment-explained-pcd-offset-centre-bore.html` | Rewrite |
| 10 | `/blog/bmw-m-wheel-fitment/bmw-g80-m3-forged-wheels` | `/blog/bmw-m-wheel-fitment/bmw-g80-m3-forged-wheels.html` | Rewrite |
| 11 | `/blog/bmw-m-wheel-fitment/staggered-vs-square-wheel-setups` | `/blog/bmw-m-wheel-fitment/staggered-vs-square-wheel-setups.html` | Rewrite |
| 12 | `/blog/buying-forged-wheels-south-africa/how-much-do-forged-wheels-cost-in-south-africa` | `/blog/buying-forged-wheels-south-africa/how-much-do-forged-wheels-cost-in-south-africa.html` | Rewrite |
| 13 | `/blog/buying-forged-wheels-south-africa/in-stock-vs-made-to-order-forged-wheels` | `/blog/buying-forged-wheels-south-africa/in-stock-vs-made-to-order-forged-wheels.html` | Rewrite |
| 14 | `/blog/buying-forged-wheels-south-africa/choosing-a-wheel-finish-for-your-bmw-m-car` | `/blog/buying-forged-wheels-south-africa/choosing-a-wheel-finish-for-your-bmw-m-car.html` | Rewrite |
| 15 | `/blog/wheel-care/how-to-clean-forged-wheels` | `/blog/wheel-care/how-to-clean-forged-wheels.html` | Rewrite |
| 16 | `/blog/wheel-care/wheel-bolt-torque-and-care` | `/blog/wheel-care/wheel-bolt-torque-and-care.html` | Rewrite |
| 17 | `/blog/wheel-care/protecting-wheels-from-potholes` | `/blog/wheel-care/protecting-wheels-from-potholes.html` | Rewrite |

Plain list (source -> destination):

```
/blog -> /blog.html
/blog/forged-wheel-basics -> /blog/forged-wheel-basics.html
/blog/bmw-m-wheel-fitment -> /blog/bmw-m-wheel-fitment.html
/blog/buying-forged-wheels-south-africa -> /blog/buying-forged-wheels-south-africa.html
/blog/wheel-care -> /blog/wheel-care.html
/blog/forged-wheel-basics/forged-vs-cast-vs-flow-formed-wheels -> /blog/forged-wheel-basics/forged-vs-cast-vs-flow-formed-wheels.html
/blog/forged-wheel-basics/unsprung-weight-explained -> /blog/forged-wheel-basics/unsprung-weight-explained.html
/blog/forged-wheel-basics/are-forged-wheels-worth-it -> /blog/forged-wheel-basics/are-forged-wheels-worth-it.html
/blog/bmw-m-wheel-fitment/wheel-fitment-explained-pcd-offset-centre-bore -> /blog/bmw-m-wheel-fitment/wheel-fitment-explained-pcd-offset-centre-bore.html
/blog/bmw-m-wheel-fitment/bmw-g80-m3-forged-wheels -> /blog/bmw-m-wheel-fitment/bmw-g80-m3-forged-wheels.html
/blog/bmw-m-wheel-fitment/staggered-vs-square-wheel-setups -> /blog/bmw-m-wheel-fitment/staggered-vs-square-wheel-setups.html
/blog/buying-forged-wheels-south-africa/how-much-do-forged-wheels-cost-in-south-africa -> /blog/buying-forged-wheels-south-africa/how-much-do-forged-wheels-cost-in-south-africa.html
/blog/buying-forged-wheels-south-africa/in-stock-vs-made-to-order-forged-wheels -> /blog/buying-forged-wheels-south-africa/in-stock-vs-made-to-order-forged-wheels.html
/blog/buying-forged-wheels-south-africa/choosing-a-wheel-finish-for-your-bmw-m-car -> /blog/buying-forged-wheels-south-africa/choosing-a-wheel-finish-for-your-bmw-m-car.html
/blog/wheel-care/how-to-clean-forged-wheels -> /blog/wheel-care/how-to-clean-forged-wheels.html
/blog/wheel-care/wheel-bolt-torque-and-care -> /blog/wheel-care/wheel-bolt-torque-and-care.html
/blog/wheel-care/protecting-wheels-from-potholes -> /blog/wheel-care/protecting-wheels-from-potholes.html
```
