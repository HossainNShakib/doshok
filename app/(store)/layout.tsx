import Link from "next/link"
import { Bell, ChevronDown, MapPin, Search, ShoppingCart, User, Package } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CartCount } from "@/components/store/cart-count"
import { MobileMenu } from "@/components/store/mobile-menu"
import { SiteFooter } from "@/components/store/site-footer"
import { AnnouncementBar } from "@/components/store/announcement-bar"
import styles from "./layout.module.css"

const DEFAULT_QUICK_LINKS = [
  { label: "Help", href: "/help" },
  { label: "Policy", href: "/policy" },
  { label: "About Doshok", href: "/about" },
  { label: "Track Order", href: "/track-order" },
]

async function getHeaderCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 8,
    })
  } catch {
    return []
  }
}

async function getHeaderLinks() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
    if (settings?.headerQuickLinks) {
      const links = JSON.parse(settings.headerQuickLinks)
      if (Array.isArray(links) && links.length > 0) return links.map((href: string) => ({ label: getLabelFromHref(href), href }))
    }
  } catch {}
  return DEFAULT_QUICK_LINKS
}

function getLabelFromHref(href: string): string {
  const map: Record<string, string> = {
    "/products": "Products",
    "/new-arrivals": "New Arrivals",
    "/about": "About Doshok",
    "/contact": "Contact",
    "/faq": "FAQ",
    "/size-guide": "Size Guide",
    "/care-guide": "Care Guide",
    "/track-order": "Track Order",
    "/privacy": "Privacy Policy",
    "/terms": "Terms",
    "/return-policy": "Return Policy",
    "/delivery": "Delivery",
    "/shipping": "Shipping",
    "/cookies": "Cookies",
    "/help": "Help",
    "/policy": "Policy",
    "/stories": "Stories",
    "/store-locator": "Store Locator",
    "/gift-cards": "Gift Cards",
    "/careers": "Careers",
  }
  return map[href] || href.replace("/", "").replace(/-/g, " ")
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, quickLinks] = await Promise.all([
    getHeaderCategories(),
    getHeaderLinks(),
  ])
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className={styles.shell}>
      <div className={styles.page}>
        <AnnouncementBar />
        <header>
          <div className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <MapPin className="h-[13px] w-[13px]" />
              <span>Inside Chattogram delivery available</span>
            </div>
            <div className={styles.topbarRight}>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ))}
              <span className={styles.divider} />
              {isLoggedIn ? (
                <>
                  <Link href="/account" className={styles.login}>Account</Link>
                  <Link href="/account/orders" className={styles.login}>Orders</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register" className={styles.signup}>
                    Sign Up
                  </Link>
                  <Link href="/auth/login" className={styles.login}>Login</Link>
                </>
              )}
            </div>
          </div>

          <div className={styles.navbar}>
            <Link href="/" className={styles.logo}>
              <span className={styles.mark}>D</span>
              <span className={styles.word}>
                Doshok<span className="text-[#ee2c3c]">.</span>com
              </span>
            </Link>

            <form action="/search" className={styles.searchWrap}>
              <details className={styles.categoryDetails}>
                <summary className={styles.catSelect}>
                  <span>All Category</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </summary>
                <div className={styles.categoryMenu}>
                  <Link href="/products">All Products</Link>
                  {categories.map((category) => (
                    <Link key={category.id} href={`/products?category=${category.slug}`}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </details>
              <input
                name="q"
                type="search"
                placeholder="Search product or brand here..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn} aria-label="Search">
                <Search className="h-[18px] w-[18px]" />
              </button>
            </form>

            <div className={styles.navIcons}>
              <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                <CartCount />
              </Link>
              <Link href="/track-order" className={styles.iconBtn} aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
              <Link href={isLoggedIn ? "/account" : "/auth/login"} className={styles.iconBtn} aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
              <MobileMenu isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
