# Client fitment studio re-shoots

Turns a customer's phone photo of a car on FORGED wheels into the two studio images the
Client Fitments gallery shows: a front three-quarter and an exact side profile, same car,
same wheels, same finish, on one shared seamless backdrop.

Pipeline (Gemini 3 Pro Image via OpenRouter, ~US$0.14 per image at 2K):

1. Put the phone photos in a `raw/` folder next to these scripts and describe each car in
   `jobs.json` (`slug`, `make`, `family`, `chassis`, `body`, `paint`, `wheelLook`, the prompt
   description `car`, the `sources` file names and any job-specific `extra` instruction).
   Fill in `wheelModel`, `wheelSlug`, `staggeredSpec`, `finishName`, `clientCity` when known;
   the site shows those rows only when present.
2. `OPENROUTER_API_KEY=... PAR=4 RES=2K ./batch_reshoot.sh [slug ...]`
   One car = front34 then side (the side is chained off the front for consistency); different
   cars run in parallel. `backdrop_ref.png` (an empty plate sampled from the approved mint-G80
   render) is passed as a reference so every car lands on the same backdrop, and each angle is
   re-rolled up to 3 times if the car-free top band shows hard edges (ceiling / light panel).
3. `python3 qa_sheet.py out` and look at every row against its phone photo: body style, paint,
   wheel design and finish, spoiler, no invented parts, clean backdrop, no turntable.
   Re-run a single angle with `./reshoot_car.py --slug <slug> --angles side ...`.
4. `python3 build_site_data.py --site ../..` copies the 1600px WebPs into
   `public/assets/fitments/<slug>/` and regenerates `src/data/clientFitments.ts`.

Known model behaviour (2026-11-09 batch): it follows the photo over the text description, so a
wrong label in `jobs.json` does not corrupt the render but does mislabel it. Without the
backdrop plate it drew a studio ceiling in 19 of 22 cars; with the plate plus the re-roll check,
40 of 44 images were clean on the first attempt. One car gained an invented GT wing until the
job's `extra` said there was none. Drive files over 10 MB cannot be fetched by the Drive
connector; attach those directly.
