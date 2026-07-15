# Ojas Nagta — Portfolio

A vintage-computing themed portfolio site: an interactive CRT terminal hero,
flowing into sections styled like an engineer's field notes, blueprint
schematics, an instrument panel, a ledger, and a telegram slip.

Plain HTML/CSS/JS — no build step, no dependencies. Deploys straight to
GitHub Pages.

## Files

- `index.html` — all content and structure
- `style.css` — all styling
- `script.js` — terminal command logic, scroll reveals, form handling

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
   - Name it `<yourusername>.github.io` if you want the site at the root
     of your GitHub domain, or anything else for a project-page URL
     (`yourusername.github.io/reponame`).
2. Push these three files (and this README) to the repo's `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<yourusername>/<reponame>.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a live URL within a minute or two. Every future
   `git push` to `main` updates the live site automatically.

## Things to customize

- **Photo**: in `index.html`, find the `polaroid-placeholder` div inside
  `#about` and replace it with `<img src="assets/photo.jpg" alt="Ojas Nagta">`.
  Add your photo file under an `assets/` folder.
- **GitHub / LinkedIn links**: in `index.html`, search for `EDIT ME` near
  `githubLink` and `linkedinLink` in the contact section, and swap the `#`
  hrefs for your real profile URLs.
- **Skill levels**: in `index.html`, each skill has a `style="--level:82%"`
  attribute — adjust the percentage to reflect your own self-assessment.
- **Contact form**: the form currently only shows a message on submit; it
  doesn't send email anywhere. Easiest options:
  - [Formspree](https://formspree.io) — sign up, get a form endpoint, set
    the `<form>`'s `action` to that URL and add `method="POST"`.
  - Or wire `contactForm`'s submit handler in `script.js` to your own backend.
- **Colors/fonts**: all design tokens are declared at the top of `style.css`
  under `:root` — change hex values or font names there to restyle globally.

## Browser terminal commands

Typing into the hero terminal supports: `help`, `about`, `projects`,
`skills`, `experience`, `contact`, `whoami`, `clear`. The buttons below the
terminal do the same thing for anyone who'd rather click.
