"""Builds PulsePlan_Report.pdf. Run: python generate_report.py (needs reportlab).

Before the final submission, fill in DEPLOYMENT_URL and FINAL_COMMIT below and add
screenshots/reference-1.png, reference-2.png and reference-3.png (one per investigated problem).
"""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# ---- Submission details -------------------------------------------------------
REPOSITORY_URL = "https://github.com/fakerA404/pulsePlan"
DEPLOYMENT_URL = "https://pulse-plan-eight.vercel.app/"
FINAL_COMMIT = "89d4ff1b61a35cf500e8f9aaff6301445e3e4678"
# -------------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "PulsePlan_Report.pdf"
SHOTS = ROOT / "screenshots"
GREEN = colors.HexColor("#173f35")
MISSING = '<font color="#a33b24"><b>[add before submission]</b></font>'

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Title2", parent=styles["Title"], alignment=TA_CENTER, textColor=GREEN))
styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=8.5, leading=11))
styles.add(ParagraphStyle(name="Cell", parent=styles["BodyText"], fontSize=7.6, leading=9.6))
styles.add(ParagraphStyle(name="Caption", parent=styles["BodyText"], fontSize=8, leading=10, textColor=colors.HexColor("#46524c")))


def p(text, style="Cell"):
    return Paragraph(text, styles[style])


def table(rows, widths, header=True):
    body = [[p(str(c)) if not isinstance(c, Paragraph) else c for c in row] for row in rows]
    t = Table(body, colWidths=[w * mm for w in widths], repeatRows=1 if header else 0)
    style = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc9c0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), GREEN), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white)]
        for i in range(len(rows[0])):
            body[0][i] = Paragraph(f'<font color="white"><b>{rows[0][i]}</b></font>', styles["Cell"])
    else:
        style.append(("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#edf3e8")))
    t.setStyle(TableStyle(style))
    return t


def shot(file, title, note, height=105):
    path = SHOTS / file
    if not path.exists():
        return [Paragraph(f"{title}: {MISSING} screenshots/{file}", styles["Small"]), Spacer(1, 3 * mm)]
    return [KeepTogether([
        Paragraph(title, styles["Heading4"]),
        Image(str(path), width=170 * mm, height=height * mm, kind="proportional"),
        Paragraph(note, styles["Caption"]),
        Spacer(1, 4 * mm),
    ])]


story = [
    Paragraph("CS4032 Web Programming - Assignment 02", styles["Title2"]),
    Paragraph("<b>PulsePlan: Fitness Session Booking</b>", styles["Heading1"]),
]

# 1. Student and project details
story += [Paragraph("1. Student and project details", styles["Heading2"]), table([
    ["Student", "Saad Arif"],
    ["Roll number", "24i-0106"],
    ["Section", "CY-A"],
    ["Business", "PulsePlan - small-group fitness studio, Islamabad"],
    ["Repository", REPOSITORY_URL],
    ["Deployment", DEPLOYMENT_URL or MISSING],
    ["Final commit", FINAL_COMMIT or MISSING],
], [38, 132], header=False)]

# 2. Business profile
story += [Paragraph("2. Business profile", styles["Heading2"]), table([
    ["Offering", "12 weekly small-group sessions: yoga, strength, Pilates, boxing, cardio and mobility (Rs 1,800 - 3,000 per attendee)."],
    ["Audience", "Adults and university students in Islamabad looking for beginner-to-advanced group classes."],
    ["Operating area", "Two studios: F-7 and G-8, Islamabad."],
    ["Main customer task", "Browse, compare, plan attendees for one or more sessions, register a lead participant and confirm."],
    ["Business goal", "A completed (simulated) booking with no lost selections or surprise charges."],
], [38, 132], header=False)]

# 3. Operating rules
story += [Paragraph("3. Operating rules", styles["Heading2"]), table([
    ["Rule", "Exact condition", "Where the user is told", "Application response", "Boundary case"],
    ["Capacity (availability)", "1-6 attendees per booking and not more than the session's spots left",
     "Browse count line; details 'Booking rules'; hint beside each quantity input",
     "Add buttons stop at the limit; invalid quantity shows a specific message and blocks confirmation",
     "6 valid, 7 rejected. Boxing (3 spots): 3 valid, 4 rejected"],
    ["Eligibility", "Lead participant age >= 16 (whole years, up to 100)",
     "Hint under Age field; details page", "Specific error; confirmation blocked", "16 valid, 15 rejected"],
    ["Pricing", "Rs 250 service fee when session total < Rs 5,000",
     "Details page; plan summary with amount needed to waive",
     "Fee added to total, or shown as 'Waived'", "Rs 4,800 -> Rs 5,050 total; Rs 5,000 -> no fee"],
], [24, 36, 38, 40, 32])]

# 4. Reference-site investigation
story += [PageBreak(), Paragraph("4. Reference-site investigation", styles["Heading2"]),
          Paragraph("Observed = what was seen on the site. Consequence = our interpretation, not measured data.", styles["Small"]),
          Spacer(1, 2 * mm)]
problems = [
    ("Problem 1 - Comparison details missing from listings", "https://www.mindbodyonline.com/explore", "reference-1.png",
     "Find a suitable class to book.",
     "'Find your new favorite' cards show price, time and distance but no class level or conditions; long titles are cut off (e.g. 'Yoga Sculpt (Full B...').",
     "Users may give up before finding a suitable class.",
     "Cards show type, level, time, duration, location, price and spots left together (Decision 2)."),
    ("Problem 2 - Availability and restrictions appear late", "https://www.mindbodyonline.com/explore (Last-minute fitness offers)", "reference-2.png",
     "Complete a booking for a chosen class.",
     "Last-minute offer cards show no spots left or restrictions, so capacity is only discovered after opening a class.",
     "Users spend time on options they cannot book and may leave.",
     "Spots and rules are shown on cards, details and beside inputs; full sessions and invalid quantities are blocked."),
    ("Problem 3 - Navigation and forms lose progress", "https://www.onepeloton.com/classes", "reference-3.png",
     "Move from discovery to registration.",
     "Moving between discovery and account/booking pages makes it easy to lose your place.",
     "Users repeat work or do not finish.",
     "Plan kept in shared state and localStorage; form keeps valid input (Decisions 1 and 3)."),
]
for title, url, img, task, observed, consequence, response in problems:
    story += [Paragraph(title, styles["Heading4"]), table([
        ["URL", url], ["User task", task], ["Observed", observed],
        ["Possible consequence", consequence], ["PulsePlan response", response],
    ], [38, 132], header=False), Spacer(1, 2 * mm)]
    story += shot(img, "Reference screenshot", "Evidence of the problem on the reference site.", height=70)

# 5. Frontend decisions
story += [PageBreak(), Paragraph("5. Frontend decisions (from DECISIONS.md)", styles["Heading2"]), table([
    ["Decision", "Alternative", "Tradeoff", "Code location"],
    ["<b>1. Persistent plan across routes</b> (state). One shared plan state in App, saved to localStorage; restored IDs checked against the schedule.",
     "Selection only in checkout, or in the URL.", "Saved IDs can go out of date and need conflict checks.",
     "src/App.jsx: addSession, updateAttendees, readSelection; CheckoutPage.jsx: missingIds"],
    ["<b>2. Availability on every card</b> (hierarchy / mobile). 3-column grid -> 1 column at 390 px; spots left as text and colour.",
     "Compact table, or availability only on details.", "Cards use more vertical space and rely on images (fallback provided).",
     "src/pages/BrowsePage.jsx; components/SessionImage.jsx; App.css .session-grid"],
    ["<b>3. In-place validation</b> (interaction). Controlled fields, hints before submit, per-field errors, valid input kept.",
     "Browser-only validation, or clearing the form.", "Custom validation has to be maintained for every rule.",
     "src/pages/CheckoutPage.jsx: submit, updateField; rules/bookingRules.js"],
], [62, 34, 34, 40])]

# 6. Implemented application
story += [Paragraph("6. Implemented application", styles["Heading2"])]
story += shot("browse-desktop.png", "Browse - 1280 px",
              "Search, filter and sort sit above the results. Each card shows availability as text ('8 spots left') next to one primary action.")
story += shot("browse-mobile.png", "Browse - 390 px", "Controls stack in one column; full-width touch targets; no horizontal overflow.", height=120)
story += shot("details-desktop.png", "Session details",
              "Facts as a definition list, rules in a highlighted notice, primary action beside the price. 'In your plan' row confirms shared state.")
story += shot("checkout-desktop.png", "Review and register",
              "Quantity hint shows the 1-6 limit and spots left; summary shows fee and how much more is needed to waive it.")
story += shot("checkout-validation.png", "Validation feedback",
              "Summary line plus per-field messages; the valid name is kept. Error state uses colour and text.")
story += shot("confirmation-desktop.png", "Confirmation", "Labelled as simulated; lists sessions, fee and total. The saved plan is cleared.")

# 7. Verification
story += [PageBreak(), Paragraph("7. Verification", styles["Heading2"]),
          Paragraph("Checked in Chromium (Playwright) at 1280 px and 390 px with the console open: no errors or React warnings.", styles["Small"]),
          Paragraph("Edge-case checklist", styles["Heading4"]), table([
              ["Case", "Action", "Expected", "Observed"],
              ["Empty results", "Search 'zzz'", "No-match message and reset action", "Pass - 'Clear search and filter' restores 12"],
              ["Invalid URL", "Open /sessions/not-real", "Explanation and browse link", "Pass"],
              ["Missing image", "Image URL fails", "Labelled placeholder", "Pass - SessionImage fallback"],
              ["Invalid form", "Name valid, age 15, phone 12345, submit", "Specific errors; name kept", "Pass"],
              ["Unavailable selection", "Plan Boxing, enable full-session demo, open checkout", "Conflict shown; confirm blocked until removed", "Pass"],
              ["Restored missing ID", "Saved plan with unknown ID", "Warning with 'Remove from plan'", "Pass"],
              ["Loading failure", "Enable failure demo, reload, then Try again", "Error then working retry", "Pass"],
          ], [30, 50, 48, 42]),
          Paragraph("Investigated improvements", styles["Heading4"]), table([
              ["Improvement", "User actions", "Expected", "Observed"],
              ["1. Persistent plan", "Add Boxing x3 and Yoga x1, open details, press Back, reload",
               "Badge shows 4; checkout lists both", "Pass"],
              ["2. Availability on cards", "Open / at 1280 and 390 px; add Boxing 3 times",
               "Spots on every card; button becomes 'Limit reached (3)'; no overflow", "Pass - overflow 0 px"],
              ["3. In-place validation", "Submit age 15 / bad phone, then change age to 16",
               "Errors specific; name kept; age error clears on edit", "Pass"],
          ], [32, 52, 52, 34]),
          Spacer(1, 4 * mm),
          Paragraph("<b>Automated test</b> (npm test -> node --test tests/): validateAttendees - 3 (valid), 6 (limit), 7 (rejected), "
                    "0 (rejected), 4 with 3 spots left (rejected). <b>Result: 5 passed, 0 failed.</b>", styles["BodyText"]),
          Spacer(1, 2 * mm),
          Paragraph("<b>Accessibility:</b> labelled inputs, buttons for actions and links for navigation, visible focus outline, "
                    "status text alongside colour, aria-invalid/aria-describedby on errors, no unintended page-wide horizontal overflow.", styles["BodyText"])]

# 8. Limitations
story += [Paragraph("8. Limitations", styles["Heading2"]), Paragraph(
    "Bookings and payments are simulated; nothing is sent to a server. Schedule and availability are local demo data, changed "
    "only through the labelled demo controls. Session photos load from Unsplash; offline they fall back to a placeholder. "
    "Only the plan is persisted - form entries reset on reload. There is no booking cutoff or account system.", styles["BodyText"])]

SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=16 * mm, leftMargin=16 * mm, topMargin=15 * mm,
                  bottomMargin=15 * mm, title="PulsePlan Report", author="Saad Arif").build(story)
print(OUT)
