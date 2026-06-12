import Link from "next/link"
import { prisma } from "@/lib/prisma"
import styles from "./site-footer.module.css"

async function getSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "default" } })
    }
    return settings
  } catch {
    return null
  }
}

const DEFAULT_SHOP_LINKS = [
  ["All Products", "/products"],
  ["New Arrivals", "/new-arrivals"],
  ["About", "/about"],
  ["Contact", "/contact"],
]

const DEFAULT_HELP_LINKS = [
  ["FAQ", "/faq"],
  ["Size Guide", "/size-guide"],
  ["Care Guide", "/care-guide"],
  ["Track Order", "/track-order"],
]

const DEFAULT_POLICY_LINKS = [
  ["Privacy Policy", "/privacy"],
  ["Terms & Conditions", "/terms"],
  ["Return Policy", "/return-policy"],
  ["Delivery", "/delivery"],
]

export async function SiteFooter() {
  const settings = await getSettings()

  let footerLinks: { label: string; href: string; group: string }[] = []
  try {
    footerLinks = JSON.parse(settings?.footerLinks || "[]")
  } catch {}

  const shopLinks = footerLinks.filter(l => l.group === "Shop").map(l => [l.label, l.href] as [string, string])
  const helpLinks = footerLinks.filter(l => l.group === "Help").map(l => [l.label, l.href] as [string, string])
  const policyLinks = footerLinks.filter(l => l.group === "Policy").map(l => [l.label, l.href] as [string, string])

  const socials = [
    ["f", settings?.facebookUrl, "Facebook"],
    ["◎", settings?.instagramUrl, "Instagram"],
    ["T", settings?.tiktokUrl, "TikTok"],
    ["▶", settings?.youtubeUrl, "YouTube"],
  ].filter((social): social is [string, string, string] => Boolean(social[1]))

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <Link href="/" className={styles.logo}>
            <span className={styles.mark}>D</span>
            <span className={styles.word}>
              {settings?.brandName || "Doshok"}<span className="text-[#364152]">.</span>com
            </span>
          </Link>
          {settings?.tagline ? (
            <div className={styles.brandTag}>{settings.tagline}</div>
          ) : (
            <div className={styles.brandTag}>Style That Speaks</div>
          )}
          {settings?.footerText && (
            <div className={styles.brandBn}>{settings.footerText}</div>
          )}
          {settings?.phone && (
            <div className={styles.contact}>
              <span>Phone: {settings.phone}</span>
            </div>
          )}
          {settings?.supportEmail && (
            <div className={styles.contact}>
              <span>Email: {settings.supportEmail}</span>
            </div>
          )}
          {settings?.address && (
            <div className={styles.contact}>
              <span>{settings.address}</span>
            </div>
          )}
          {socials.length > 0 && (
            <div className={styles.socials}>
              {socials.map(([label, href, name]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>

        {(shopLinks.length > 0 || helpLinks.length > 0 || policyLinks.length > 0) ? (
          <>
            {shopLinks.length > 0 && (
              <div key="shop" className={styles.footCol}>
                <h4>Shop</h4>
                <ul>
                  {shopLinks.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {helpLinks.length > 0 && (
              <div key="help" className={styles.footCol}>
                <h4>Help</h4>
                <ul>
                  {helpLinks.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {policyLinks.length > 0 && (
              <div key="policy" className={styles.footCol}>
                <h4>Policy</h4>
                <ul>
                  {policyLinks.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.footCol}>
              <h4>Shop</h4>
              <ul>
                {DEFAULT_SHOP_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.footCol}>
              <h4>Help</h4>
              <ul>
                {DEFAULT_HELP_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.footCol}>
              <h4>Policy</h4>
              <ul>
                {DEFAULT_POLICY_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      <div className={styles.copyright}>© {new Date().getFullYear()}, {settings?.brandName || "Doshok"}.com. All rights reserved.</div>
    </footer>
  )
}
