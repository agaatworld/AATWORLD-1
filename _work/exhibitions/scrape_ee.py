"""Read every trade show from January 2027 onward for the 16 countries the magazine covers, straight from EventsEye.

For each country: the country page has a monthly bar chart (month page link + number of shows); every month page from
January 2027 on is opened, its rows are read, and the number read is compared with the chart's number.
Output: ee_scrape.json (rows) and ee_check.txt (chart vs read, per country and month).
Run from this folder:  python3 scrape_ee.py   (needs network access to www.eventseye.com)
"""
import html, json, re, sys, time, urllib.request

BASE = "https://www.eventseye.com/fairs/"
SLUG = {"tw": "taiwan", "id": "indonesia", "my": "malaysia", "pk": "pakistan", "af": "afghanistan", "dz": "algeria", "eg": "egypt",
        "iq": "iraq", "kw": "kuwait", "ye": "yemen", "om": "oman", "qa": "qatar", "sa": "saudi-arabia", "sy": "syria",
        "ae": "uae-united-arab-emirates", "tr": "turkey"}
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
SKIP = re.compile(r"\b(mba|masters|student|university fair|study abroad|education fair|edu fair|higher education|career fair|job fair)\b", re.I)


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AAT World calendar check)"})
            return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")
        except Exception as e:  # network hiccup: wait and retry
            if i == tries - 1:
                print("FAILED", url, e, file=sys.stderr); return ""
            time.sleep(2 * (i + 1))


def txt(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).replace("\xa0", " ").strip()


def rows_of(page):
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        td = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
        if len(td) < 4 or "<b>" not in td[0]:
            continue
        link = re.search(r'href="([^"]+)"', td[0])
        name = txt(re.search(r"<b>(.*?)</b>", td[0], re.S).group(1))
        desc = txt((re.search(r"<i>(.*?)</i>", td[0], re.S) or re.search(r"()", "")).group(1))
        places = [txt(a) for a in re.findall(r"<a[^>]*>(.*?)</a>", td[2], re.S)]
        when = td[3]
        m = re.search(r"(\d\d)/(\d\d)/(\d{4})", when)
        d = re.search(r"(\d+)\s*day", when)
        if m:
            date, approx = "%s-%s-%s" % (m.group(3), m.group(1), m.group(2)), 0
        else:
            mm = re.search(r"([A-Za-z]{3})[a-z]*\.?\s+(\d{4})", txt(when))  # "March 2027 (?)" or "Jan. 2027 (?)"
            if not mm:
                print("  date not understood:", name, txt(when), file=sys.stderr); continue
            date, approx = "%s-%02d-01" % (mm.group(2), [m[:3] for m in MONTHS].index(mm.group(1).lower()) + 1), 1
        out.append({"name": name, "desc": desc, "freq": txt(td[1]), "city": places[0] if places else "", "venue": places[1] if len(places) > 1 else "",
                    "start": date, "days": int(d.group(1)) if d else 1, "approx": approx, "url": BASE + link.group(1) if link else ""})
    return out


def main():
    want = sys.argv[1:] or list(SLUG)
    allrows, check = [], []
    for cc in want:
        slug = SLUG[cc]
        page = get(BASE + "c1_trade-shows_%s.html" % slug); time.sleep(1)
        chart = []
        for href, mon, yr, body in re.findall(r'<a href="(cd1_trade-shows_%s_([a-z]+)_(\d+)\.html)"[^>]*>(.*?)</a>' % re.escape(slug), page, re.S):
            t = re.findall(r"<text[^>]*>([^<]*)</text>", body)  # month, number of shows, (year on the first month of a year)
            if len(t) >= 2 and t[1].strip().isdigit():
                chart.append((href, mon, int(yr), int(t[1])))
        # suffix 0 = this year (2026), 1 = 2027, 2 = 2028 ...
        seen = set()
        for href, mon, yr, n in chart:
            if yr < 1 or href in seen:
                continue
            seen.add(href)
            got = []
            if n:
                mp = get(BASE + href); time.sleep(1)
                got = rows_of(mp)
                # a month with more than one page of results links its next pages as ..._<mon>_<yr>_<k>.html
                for extra in sorted(set(re.findall(r'href="(cd1_trade-shows_%s_%s_%d_\d+\.html)"' % (re.escape(slug), mon, yr), mp))):
                    got += rows_of(get(BASE + extra)); time.sleep(1)
            for r in got:
                r["country"] = cc
            allrows += got
            check.append("%s %-9s %d  chart %3d  read %3d %s" % (cc, mon, 2026 + yr, n, len(got), "" if n == len(got) else "  <-- DIFFERENT"))
            print(check[-1], flush=True)
    keep = [r for r in allrows if not SKIP.search(r["name"] + " " + r["desc"])]
    print("read", len(allrows), "kept", len(keep), "(education/MBA/student fairs removed:", len(allrows) - len(keep), ")")
    json.dump(keep, open("ee_scrape.json", "w"), ensure_ascii=False, indent=0)
    open("ee_check.txt", "w").write("\n".join(check) + "\n")


if __name__ == "__main__":
    main()
