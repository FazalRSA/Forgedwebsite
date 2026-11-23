# Render rewrite rules for the blog

In the Render dashboard, open the static site that serves www.forgedsa.co.za, go to **Redirects/Rewrites**, and add these as **Rewrite** rules. Put them above the catch-all `/*` -> `/index.html` rule.

To do it from a terminal instead, run `scripts/add-blog-rules.sh` (a preview with no changes by default; `DRY_RUN=0` applies). It needs a Render API key in `RENDER_API_KEY` and reads these same rules from `render.yaml`.

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
| 18 | `/blog/bmw-m-wheel-fitment/hub-centric-rings-when-you-need-them` | `/blog/bmw-m-wheel-fitment/hub-centric-rings-when-you-need-them.html` | Rewrite |
| 19 | `/blog/bmw-m-wheel-fitment/tyre-pressure-sensors-after-a-wheel-change` | `/blog/bmw-m-wheel-fitment/tyre-pressure-sensors-after-a-wheel-change.html` | Rewrite |
| 20 | `/blog/bmw-m-wheel-fitment/plus-sizing-wheels-and-tyres` | `/blog/bmw-m-wheel-fitment/plus-sizing-wheels-and-tyres.html` | Rewrite |
| 21 | `/blog/forged-wheel-basics/how-to-read-a-wheel-load-rating` | `/blog/forged-wheel-basics/how-to-read-a-wheel-load-rating.html` | Rewrite |
| 22 | `/blog/forged-wheel-basics/painted-powder-coated-and-polished-wheel-finishes` | `/blog/forged-wheel-basics/painted-powder-coated-and-polished-wheel-finishes.html` | Rewrite |
| 23 | `/blog/wheel-care/wheel-balancing-and-alignment-after-new-wheels` | `/blog/wheel-care/wheel-balancing-and-alignment-after-new-wheels.html` | Rewrite |
| 24 | `/blog/buying-forged-wheels-south-africa/what-to-ask-before-buying-forged-wheels` | `/blog/buying-forged-wheels-south-africa/what-to-ask-before-buying-forged-wheels.html` | Rewrite |

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
/blog/bmw-m-wheel-fitment/hub-centric-rings-when-you-need-them -> /blog/bmw-m-wheel-fitment/hub-centric-rings-when-you-need-them.html
/blog/bmw-m-wheel-fitment/tyre-pressure-sensors-after-a-wheel-change -> /blog/bmw-m-wheel-fitment/tyre-pressure-sensors-after-a-wheel-change.html
/blog/bmw-m-wheel-fitment/plus-sizing-wheels-and-tyres -> /blog/bmw-m-wheel-fitment/plus-sizing-wheels-and-tyres.html
/blog/forged-wheel-basics/how-to-read-a-wheel-load-rating -> /blog/forged-wheel-basics/how-to-read-a-wheel-load-rating.html
/blog/forged-wheel-basics/painted-powder-coated-and-polished-wheel-finishes -> /blog/forged-wheel-basics/painted-powder-coated-and-polished-wheel-finishes.html
/blog/wheel-care/wheel-balancing-and-alignment-after-new-wheels -> /blog/wheel-care/wheel-balancing-and-alignment-after-new-wheels.html
/blog/buying-forged-wheels-south-africa/what-to-ask-before-buying-forged-wheels -> /blog/buying-forged-wheels-south-africa/what-to-ask-before-buying-forged-wheels.html
```
