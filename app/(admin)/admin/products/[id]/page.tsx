"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AdminBackLink, AdminPageHeader, AdminSectionCard, AdminStatusBadge } from "@/components/admin/admin-ui"
import { ImageUploader } from "@/components/admin/image-uploader"
import { AlertTriangle, Archive, ExternalLink, EyeOff, Layers, Save, SendHorizonal } from "lucide-react"
import { LOW_STOCK_THRESHOLD } from "@/types"
import { slugifyName } from "@/lib/slug"

type VariantInput = {
  size: string
  color: string
  colorHex: string
  stock: number
  sku: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [variants, setVariants] = useState<VariantInput[]>([])
  const [pageType, setPageType] = useState("NORMAL")
  const [productImages, setProductImages] = useState<string[]>([])
  const [landingHeroImage, setLandingHeroImage] = useState("")
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("Draft")
  const [description, setDescription] = useState("")
  const [oldPrice, setOldPrice] = useState("")
  const [featured, setFeatured] = useState(false)
  const [defaultCouponCode, setDefaultCouponCode] = useState("")
  const [landingHeadline, setLandingHeadline] = useState("")
  const [landingSubheadline, setLandingSubheadline] = useState("")
  const [landingCopy, setLandingCopy] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products/${productId}`).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      if (catData.success) setCategories(catData.data)
      if (prodData.success) {
        const p = prodData.data
        setName(p.name ?? "")
        setSlug(p.slug ?? "")
        setDescription(p.description ?? "")
        setPrice(p.price?.toString() ?? "")
        setOldPrice(p.oldPrice?.toString() ?? "")
        setCategoryId(p.categoryId ?? "")
        setFeatured(p.featured ?? false)
        setStatus(p.status ?? "Draft")
        setPageType(p.pageType ?? "NORMAL")
        setProductImages(p.images ?? [])
        setLandingHeroImage(p.landingHeroImage ?? "")
        setDefaultCouponCode(p.defaultCouponCode ?? "")
        setLandingHeadline(p.landingHeadline ?? "")
        setLandingSubheadline(p.landingSubheadline ?? "")
        setLandingCopy(p.landingCopy ?? "")
        setVariants(
          (p.variants ?? []).map((v: VariantInput & { id: string }) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? "",
            stock: v.stock,
            sku: v.sku ?? "",
          }))
        )
      }
      setFetching(false)
    }).catch(() => setFetching(false))
  }, [productId])

  const totalVariants = variants.filter((v) => v.size && v.color).length
  const totalStock = variants.reduce((s, v) => s + v.stock, 0)
  const lowStockVariants = variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).length
  const noImages = productImages.length === 0
  const noCategory = !categoryId
  const noVariants = totalVariants === 0

  function addVariant() {
    setVariants([...variants, { size: "", color: "", colorHex: "", stock: 0, sku: "" }])
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManuallyEdited && value.trim()) {
      setSlug(slugifyName(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    setSlugManuallyEdited(true)
  }

  function updateVariant(i: number, field: keyof VariantInput, value: string | number) {
    const next = [...variants]
    next[i] = { ...next[i], [field]: value }
    setVariants(next)
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(publishStatus: string) {
    setLoading(true)

    const body: Record<string, unknown> = {
      name,
      slug,
      description: description || undefined,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      images: productImages,
      categoryId,
      featured,
      status: publishStatus,
      pageType,
      defaultCouponCode: defaultCouponCode?.toUpperCase() || undefined,
      variants: variants.filter((v) => v.size && v.color),
    }

    if (pageType === "LANDING") {
      body.landingHeadline = landingHeadline || undefined
      body.landingSubheadline = landingSubheadline || undefined
      body.landingCopy = landingCopy || undefined
      body.landingHeroImage = landingHeroImage || undefined
    }

    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (data.success) {
      toast.success(publishStatus === "Draft" ? "Product saved as draft" : publishStatus === "Active" ? "Product published" : `Product saved (${publishStatus})`)
      setStatus(publishStatus)
      router.refresh()
    } else {
      toast.error(data.error ?? "Failed to update product")
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    )
  }

  const previewUrl = pageType === "LANDING" ? `/l/${slug}?preview=1` : `/products/${slug}?preview=1`

  return (
    <div className="max-w-6xl space-y-5">
      <AdminPageHeader eyebrow="Commerce" title="Edit Product" description="Update catalog details, stock variants, and publishing status." />
      <AdminBackLink href="/admin/products" label="Back to Products" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:gap-6">
        <div className="space-y-5">
          <AdminSectionCard title="Basic Information">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Premium Cotton Panjabi" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug <span className="text-red-500">*</span> {slug && <span className="text-slate-400 font-normal text-[10px]">/{slug}</span>}</Label>
                  <Input id="slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="e.g. premium-cotton-panjabi" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description shown on the storefront." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                  <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                    <SelectTrigger className={noCategory ? "border-amber-300" : ""}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {noCategory && <p className="text-[10px] text-amber-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Required</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pageType">Page type</Label>
                  <Select value={pageType} onValueChange={(v) => v && setPageType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="LANDING">Landing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Product Images">
            <div className="space-y-2">
              <ImageUploader
                images={productImages}
                onChange={setProductImages}
                label=""
                helperText="First image is the primary. Upload clear product photos."
                folder="products"
              />
              {noImages && <p className="text-[11px] text-amber-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No images yet</p>}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Pricing">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (BDT) <span className="text-red-500">*</span></Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2490" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oldPrice">Compare price <span className="text-slate-400 font-normal text-[10px]">(optional)</span></Label>
                <Input id="oldPrice" type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="e.g. 2990" />
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Variants">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Add size and color combinations with stock levels.</p>
                  {totalVariants > 0 && (
                    <div className="flex gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{totalVariants} variant{totalVariants !== 1 ? "s" : ""}</span>
                      <span>· {totalStock} total stock</span>
                      {lowStockVariants > 0 && <span className="text-amber-500 font-medium">{lowStockVariants} low stock</span>}
                    </div>
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-lg h-8 text-xs">
                  + Add variant
                </Button>
              </div>
              {variants.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Layers className="mx-auto mb-2 h-5 w-5 text-slate-300" />
                  <p className="text-xs text-slate-500">No variants yet. Add one to manage inventory.</p>
                </div>
              )}
              {variants.map((v, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-slate-200/60 p-3 md:grid-cols-[1fr_1fr_90px_70px_1fr_auto] md:items-center">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Size</Label>
                    <Select value={v.size} onValueChange={(val) => val && updateVariant(i, "size", val)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Size" /></SelectTrigger>
                      <SelectContent>
                        {["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Color</Label>
                    <Select value={v.color} onValueChange={(val) => val && updateVariant(i, "color", val)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Color" /></SelectTrigger>
                      <SelectContent>
                        {["Black", "White", "Maroon", "Olive", "Navy", "Beige", "Pink", "Red", "Blue", "Green", "Grey", "Brown", "Cream", "Mustard", "Teal"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hex</Label>
                    <div className="flex items-center gap-1.5">
                      {v.colorHex && /^#[0-9a-fA-F]{3,6}$/.test(v.colorHex) && (
                        <span className="h-5 w-5 shrink-0 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                      )}
                      <Input value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="h-8 font-mono text-[11px]" placeholder="#" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Stock</Label>
                    <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className={`h-8 text-xs ${v.stock === 0 ? "text-slate-400" : ""}`} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">SKU <span className="text-slate-300">(opt.)</span></Label>
                    <Input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="h-8 text-[11px]" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-600 mt-4 md:mt-0" onClick={() => removeVariant(i)}>Remove</Button>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          {pageType === "LANDING" && (
            <AdminSectionCard title="Landing Campaign">
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Recommended copy structure</p>
                  <p><strong>Headline</strong> — Single bold offer line.</p>
                  <p><strong>Subheadline</strong> — One-line value prop.</p>
                  <p><strong>Copy</strong> — 3–5 lines: what, why, benefits, CTA.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="landingHeadline">Landing headline</Label>
                  <Input id="landingHeadline" value={landingHeadline} onChange={(e) => setLandingHeadline(e.target.value)} placeholder="Limited Edition Drop" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="landingSubheadline">Landing subheadline</Label>
                  <Input id="landingSubheadline" value={landingSubheadline} onChange={(e) => setLandingSubheadline(e.target.value)} placeholder="Crafted for the season" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="landingCopy">Landing copy</Label>
                  <Textarea id="landingCopy" rows={4} value={landingCopy} onChange={(e) => setLandingCopy(e.target.value)} placeholder="Write the campaign copy customers will see on the landing page." />
                </div>
                <div className="space-y-1.5">
                  <Label>Landing hero image</Label>
                  <ImageUploader
                    images={landingHeroImage ? [landingHeroImage] : []}
                    onChange={(imgs) => setLandingHeroImage(imgs[0] || "")}
                    single
                    label=""
                    helperText="Recommended size: 1200x800px."
                    folder="landing"
                  />
                </div>
              </div>
            </AdminSectionCard>
          )}

          <AdminSectionCard title="Publishing">
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Control who can see this product on the storefront.</p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                  <span className="text-xs font-medium text-slate-700">Featured product</span>
                </label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="defaultCouponCode">Default coupon code <span className="text-slate-400 font-normal text-[10px]">(optional)</span></Label>
                <Input id="defaultCouponCode" value={defaultCouponCode} onChange={(e) => setDefaultCouponCode(e.target.value)} placeholder="WELCOME10" className="uppercase max-w-xs text-xs" />
              </div>
            </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name</span>
                  <span className="font-medium text-slate-700 text-right max-w-[130px] truncate">{name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slug</span>
                  <span className="font-mono text-[10px] text-right max-w-[130px] truncate">{slug || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-right max-w-[130px] truncate text-slate-700">{categories.find((c) => c.id === categoryId)?.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span><AdminStatusBadge status={status} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="font-semibold tabular-nums text-slate-800">{price ? `৳${Number(price).toLocaleString()}` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Variants</span>
                  <span className="tabular-nums">{totalVariants || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Images</span>
                  <span className="tabular-nums">{productImages.length || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock</span>
                  <span className={`tabular-nums font-semibold ${totalStock === 0 && totalVariants > 0 ? "text-amber-500" : ""}`}>{totalStock || "—"}</span>
                </div>
              </div>
            </div>

            {(noImages || noCategory || noVariants) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-2">Missing</h3>
                <ul className="space-y-1">
                  {noImages && <li className="text-[11px] text-amber-600 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 shrink-0" /> No product images</li>}
                  {noCategory && <li className="text-[11px] text-amber-600 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 shrink-0" /> No category selected</li>}
                  {noVariants && <li className="text-[11px] text-amber-600 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 shrink-0" /> No variants added</li>}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Publish</h3>
              <div className="space-y-2">
                <Button type="button" disabled={loading} onClick={() => handleSubmit("Draft")} variant={status === "Draft" ? "default" : "outline"} className="w-full h-9 rounded-lg justify-start gap-2 text-xs font-semibold">
                  <Save className="h-3.5 w-3.5" /> Save Draft
                </Button>
                <Button type="button" disabled={loading} onClick={() => handleSubmit("Active")} className="w-full h-9 rounded-lg justify-start gap-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white">
                  <SendHorizonal className="h-3.5 w-3.5" /> Publish
                </Button>
                <Button type="button" disabled={loading} onClick={() => handleSubmit("Hidden")} variant="secondary" className="w-full h-9 rounded-lg justify-start gap-2 text-xs font-semibold">
                  <EyeOff className="h-3.5 w-3.5" /> Hide
                </Button>
                <Button type="button" disabled={loading} onClick={() => handleSubmit("Archived")} variant="outline" className="w-full h-9 rounded-lg justify-start gap-2 text-xs font-semibold text-slate-400">
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
              </div>
            </div>

            {slug && (
              <Link
                href={previewUrl}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-slate-200/60 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Preview {pageType === "LANDING" ? "Landing" : "Product"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}