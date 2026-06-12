import { prisma } from "@/lib/prisma"

export type MenuItemData = {
  id: string
  title: string
  url: string
  target: string
  order: number
  parentId: string | null
  children: MenuItemData[]
}

function buildTree(items: MenuItemData[]): MenuItemData[] {
  const map = new Map<string, MenuItemData>()
  const roots: MenuItemData[] = []

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  items.forEach((item) => {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export async function getMenuItems(location: string): Promise<MenuItemData[]> {
  try {
    const items = await prisma.menuItem.findMany({
      where: { location },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
    return buildTree(items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      target: item.target,
      order: item.order,
      parentId: item.parentId,
      children: [],
    })))
  } catch {
    return []
  }
}

export async function getDesktopMenu(): Promise<MenuItemData[]> {
  return getMenuItems("desktop")
}

export async function getMobileMenu(): Promise<MenuItemData[]> {
  return getMenuItems("mobile")
}

export async function getFooterMenu(): Promise<MenuItemData[]> {
  return getMenuItems("footer")
}