"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Plus, X, Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { createProductType } from "@/lib/services/product-types"
import type { SpecificationCategory, QuickSpec, ShowcaseItem, FeatureCard, LookbookImage, PurchasePoint } from "@/lib/types/database"

const ICON_OPTIONS = [
  { value: "zap", label: "Zap (Lightning)" },
  { value: "shield", label: "Shield" },
  { value: "cpu", label: "CPU / Chip" },
  { value: "cable", label: "Cable" },
  { value: "check-circle", label: "Check Circle" },
  { value: "gauge", label: "Gauge / Speed" },
  { value: "battery", label: "Battery" },
  { value: "truck", label: "Truck / Shipping" },
  { value: "star", label: "Star" },
  { value: "heart", label: "Heart" },
  { value: "award", label: "Award" },
  { value: "box", label: "Box / Package" },
  { value: "wifi", label: "WiFi" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "monitor", label: "Monitor" },
  { value: "smartphone", label: "Smartphone" },
  { value: "headphones", label: "Headphones" },
  { value: "volume-2", label: "Speaker" },
  { value: "thermometer", label: "Thermometer" },
  { value: "droplet", label: "Droplet" },
  { value: "sun", label: "Sun" },
  { value: "lock", label: "Lock" },
  { value: "refresh-cw", label: "Refresh / Cycle" },
  { value: "layers", label: "Layers" },
]

export default function NewTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  
  // Specifications
  const [specifications, setSpecifications] = useState<SpecificationCategory[]>([
    { category: "", icon: "zap", specs: [{ label: "", value: "" }] }
  ])
  const [quickSpecs, setQuickSpecs] = useState<QuickSpec[]>([
    { icon: "zap", label: "", value: "" },
    { icon: "gauge", label: "", value: "" },
    { icon: "shield", label: "", value: "" },
  ])

  // Showcase
  const [showcaseHeading, setShowcaseHeading] = useState("Details that matter")
  const [showcaseSubheading, setShowcaseSubheading] = useState("")
  const [showcaseItems, setShowcaseItems] = useState<(ShowcaseItem & { file?: File })[]>([
    { heading: "", text: "", image: "" }
  ])

  // Comparison
  const [comparisonHeading, setComparisonHeading] = useState("REDEFINING THE STANDARD")
  const [comparisonSubheading, setComparisonSubheading] = useState("Not all products are created equal. Here's why we stand apart.")
  const [comparisonFeatures, setComparisonFeatures] = useState<string[]>([""])

  // Features
  const [featuresHeading, setFeaturesHeading] = useState("Why you'll love it")
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([{ title: "", body: "" }])

  // Lookbook
  const [lookbookImages, setLookbookImages] = useState<(LookbookImage & { file?: File })[]>([
    { src: "", alt: "" }
  ])

  // Purchase points
  const [purchasePoints, setPurchasePoints] = useState<PurchasePoint[]>([
    { icon: "zap", heading: "", text: "" },
    { icon: "shield", heading: "", text: "" },
    { icon: "truck", heading: "", text: "" },
  ])

  // ---- Spec helpers ----
  const addSpecCategory = () => {
    setSpecifications([...specifications, { category: "", icon: "zap", specs: [{ label: "", value: "" }] }])
  }
  const removeSpecCategory = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx))
  }
  const updateSpecCategory = (idx: number, field: string, val: string) => {
    const updated = [...specifications]
    updated[idx] = { ...updated[idx], [field]: val }
    setSpecifications(updated)
  }
  const addSpec = (catIdx: number) => {
    const updated = [...specifications]
    updated[catIdx].specs.push({ label: "", value: "" })
    setSpecifications(updated)
  }
  const removeSpec = (catIdx: number, specIdx: number) => {
    const updated = [...specifications]
    updated[catIdx].specs = updated[catIdx].specs.filter((_, i) => i !== specIdx)
    setSpecifications(updated)
  }
  const updateSpec = (catIdx: number, specIdx: number, field: string, val: string) => {
    const updated = [...specifications]
    updated[catIdx].specs[specIdx] = { ...updated[catIdx].specs[specIdx], [field]: val }
    setSpecifications(updated)
  }

  // ---- Quick spec helpers ----
  const updateQuickSpec = (idx: number, field: string, val: string) => {
    const updated = [...quickSpecs]
    updated[idx] = { ...updated[idx], [field]: val }
    setQuickSpecs(updated)
  }

  // ---- Showcase helpers ----
  const addShowcaseItem = () => {
    setShowcaseItems([...showcaseItems, { heading: "", text: "", image: "" }])
  }
  const removeShowcaseItem = (idx: number) => {
    setShowcaseItems(showcaseItems.filter((_, i) => i !== idx))
  }
  const updateShowcaseItem = (idx: number, field: string, val: string) => {
    const updated = [...showcaseItems]
    updated[idx] = { ...updated[idx], [field]: val }
    setShowcaseItems(updated)
  }
  const handleShowcaseImage = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const updated = [...showcaseItems]
      updated[idx] = { ...updated[idx], file }
      const reader = new FileReader()
      reader.onloadend = () => {
        updated[idx].image = reader.result as string
        setShowcaseItems([...updated])
      }
      reader.readAsDataURL(file)
    }
  }

  // ---- Comparison helpers ----
  const addComparisonFeature = () => setComparisonFeatures([...comparisonFeatures, ""])
  const removeComparisonFeature = (idx: number) => setComparisonFeatures(comparisonFeatures.filter((_, i) => i !== idx))
  const updateComparisonFeature = (idx: number, val: string) => {
    const updated = [...comparisonFeatures]
    updated[idx] = val
    setComparisonFeatures(updated)
  }

  // ---- Feature card helpers ----
  const addFeatureCard = () => setFeatureCards([...featureCards, { title: "", body: "" }])
  const removeFeatureCard = (idx: number) => setFeatureCards(featureCards.filter((_, i) => i !== idx))
  const updateFeatureCard = (idx: number, field: string, val: string) => {
    const updated = [...featureCards]
    updated[idx] = { ...updated[idx], [field]: val }
    setFeatureCards(updated)
  }

  // ---- Lookbook helpers ----
  const addLookbookImage = () => setLookbookImages([...lookbookImages, { src: "", alt: "" }])
  const removeLookbookImage = (idx: number) => setLookbookImages(lookbookImages.filter((_, i) => i !== idx))
  const updateLookbookAlt = (idx: number, val: string) => {
    const updated = [...lookbookImages]
    updated[idx] = { ...updated[idx], alt: val }
    setLookbookImages(updated)
  }
  const handleLookbookImage = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const updated = [...lookbookImages]
      updated[idx] = { ...updated[idx], file }
      const reader = new FileReader()
      reader.onloadend = () => {
        updated[idx].src = reader.result as string
        setLookbookImages([...updated])
      }
      reader.readAsDataURL(file)
    }
  }

  // ---- Purchase point helpers ----
  const updatePurchasePoint = (idx: number, field: string, val: string) => {
    const updated = [...purchasePoints]
    updated[idx] = { ...updated[idx], [field]: val }
    setPurchasePoints(updated)
  }

  // ---- Image upload utility ----
  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Date.now()}.${fileExt}`
      const filePath = `product-types/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Please enter a type name')
      return
    }

    setLoading(true)

    try {
      // Upload showcase images
      const finalShowcaseItems: ShowcaseItem[] = []
      for (const item of showcaseItems) {
        let imageUrl = item.image
        if (item.file) {
          const url = await uploadImage(item.file, `showcase-${item.heading.replace(/\s+/g, '-').toLowerCase()}`)
          if (url) imageUrl = url
        }
        if (item.heading.trim() || item.text.trim()) {
          finalShowcaseItems.push({ heading: item.heading, text: item.text, image: imageUrl.startsWith('data:') ? '' : imageUrl })
        }
      }

      // Upload lookbook images
      const finalLookbookImages: LookbookImage[] = []
      for (const item of lookbookImages) {
        let src = item.src
        if (item.file) {
          const url = await uploadImage(item.file, `lookbook-${Date.now()}`)
          if (url) src = url
        }
        if (src && !src.startsWith('data:')) {
          finalLookbookImages.push({ src, alt: item.alt })
        }
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      // Filter out empty entries
      const finalSpecs = specifications.filter(s => s.category.trim()).map(s => ({
        ...s,
        specs: s.specs.filter(sp => sp.label.trim())
      }))
      const finalQuickSpecs = quickSpecs.filter(q => q.label.trim())
      const finalComparisonFeatures = comparisonFeatures.filter(f => f.trim())
      const finalFeatureCards = featureCards.filter(f => f.title.trim())
      const finalPurchasePoints = purchasePoints.filter(p => p.heading.trim())

      const { error } = await createProductType({
        name: name.trim(),
        slug,
        specifications: finalSpecs,
        quick_specs: finalQuickSpecs,
        showcase_heading: showcaseHeading,
        showcase_subheading: showcaseSubheading,
        showcase_items: finalShowcaseItems,
        comparison_heading: comparisonHeading,
        comparison_subheading: comparisonSubheading,
        comparison_features: finalComparisonFeatures,
        features_heading: featuresHeading,
        feature_cards: finalFeatureCards,
        lookbook_images: finalLookbookImages,
        purchase_points: finalPurchasePoints,
      })

      if (error) {
        alert(`Failed to create type: ${error}`)
      } else {
        alert('Product type created successfully!')
        router.push('/types')
      }
    } catch (error) {
      console.error('Error creating type:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/types" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">New Product Type</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Type</>}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Type Name *</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
              placeholder="e.g. USB Cable, Charger, Power Bank"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">This name will be used to categorize products</p>
          </div>

          {/* ====== 1. SPECIFICATIONS ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">1. Technical Specifications</h2>
                <p className="text-sm text-muted-foreground mt-1">Define spec categories and their key-value pairs (accordion on product page)</p>
              </div>
              <button type="button" onClick={addSpecCategory} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="space-y-6">
              {specifications.map((cat, catIdx) => (
                <div key={catIdx} className="p-4 border border-border rounded-lg relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Category Name</label>
                        <input type="text" value={cat.category} onChange={(e) => updateSpecCategory(catIdx, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                          placeholder="e.g. Performance, Build Quality" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <select value={cat.icon} onChange={(e) => updateSpecCategory(catIdx, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20">
                          {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {specifications.length > 1 && (
                      <button type="button" onClick={() => removeSpecCategory(catIdx)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {cat.specs.map((spec, specIdx) => (
                      <div key={specIdx} className="flex items-center gap-2">
                        <input type="text" value={spec.label} onChange={(e) => updateSpec(catIdx, specIdx, 'label', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                          placeholder="Label (e.g. Power Delivery)" />
                        <input type="text" value={spec.value} onChange={(e) => updateSpec(catIdx, specIdx, 'value', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                          placeholder="Value (e.g. 60W)" />
                        {cat.specs.length > 1 && (
                          <button type="button" onClick={() => removeSpec(catIdx, specIdx)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addSpec(catIdx)} className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                      + Add Spec
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Specs */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2">Quick Specs Preview (3 highlighted specs shown when collapsed)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickSpecs.map((qs, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-lg space-y-2">
                    <select value={qs.icon} onChange={(e) => updateQuickSpec(idx, 'icon', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none">
                      {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="text" value={qs.label} onChange={(e) => updateQuickSpec(idx, 'label', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                      placeholder="Label (e.g. Power Delivery)" />
                    <input type="text" value={qs.value} onChange={(e) => updateQuickSpec(idx, 'value', e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                      placeholder="Value (e.g. 60W Fast Charging)" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ====== 2. SPECIALTY SHOWCASE ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">2. Specialty Showcase</h2>
                <p className="text-sm text-muted-foreground mt-1">Image cards showing product details (4 tiles on product page)</p>
              </div>
              <button type="button" onClick={addShowcaseItem} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Section Heading</label>
                <input type="text" value={showcaseHeading} onChange={(e) => setShowcaseHeading(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section Subheading</label>
                <input type="text" value={showcaseSubheading} onChange={(e) => setShowcaseSubheading(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
            </div>

            <div className="space-y-4">
              {showcaseItems.map((item, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.image && !item.image.startsWith('data:') ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100">
                          <Image src={item.image} alt="" fill className="object-cover" />
                        </div>
                      ) : item.file ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100">
                          <Image src={URL.createObjectURL(item.file)} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-foreground transition-colors">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Image</span>
                          <input type="file" accept="image/*" onChange={(e) => handleShowcaseImage(idx, e)} className="hidden" />
                        </label>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input type="text" value={item.heading} onChange={(e) => updateShowcaseItem(idx, 'heading', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                        placeholder="Heading (e.g. Premium braid)" />
                      <textarea value={item.text} onChange={(e) => updateShowcaseItem(idx, 'text', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none resize-none"
                        placeholder="Description text" />
                    </div>
                    {showcaseItems.length > 1 && (
                      <button type="button" onClick={() => removeShowcaseItem(idx)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ====== 3. COMPARISON ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">3. Comparison Section</h2>
                <p className="text-sm text-muted-foreground mt-1">Features compared between your product vs others (check vs cross)</p>
              </div>
              <button type="button" onClick={addComparisonFeature} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Feature
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Section Heading</label>
                <input type="text" value={comparisonHeading} onChange={(e) => setComparisonHeading(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section Subheading</label>
                <input type="text" value={comparisonSubheading} onChange={(e) => setComparisonSubheading(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20" />
              </div>
            </div>

            <div className="space-y-2">
              {comparisonFeatures.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" value={f} onChange={(e) => updateComparisonFeature(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                    placeholder="Feature name (e.g. Durability Tested)" />
                  {comparisonFeatures.length > 1 && (
                    <button type="button" onClick={() => removeComparisonFeature(idx)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ====== 4. FEATURES ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">4. Feature Cards</h2>
                <p className="text-sm text-muted-foreground mt-1">Grid of feature cards with title and body text</p>
              </div>
              <button type="button" onClick={addFeatureCard} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Section Heading</label>
              <input type="text" value={featuresHeading} onChange={(e) => setFeaturesHeading(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-foreground/20" />
            </div>

            <div className="space-y-3">
              {featureCards.map((card, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" value={card.title} onChange={(e) => updateFeatureCard(idx, 'title', e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                      placeholder="Title (e.g. Premium braid)" />
                    <input type="text" value={card.body} onChange={(e) => updateFeatureCard(idx, 'body', e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                      placeholder="Description text" />
                  </div>
                  {featureCards.length > 1 && (
                    <button type="button" onClick={() => removeFeatureCard(idx)} className="p-1 text-red-600 hover:bg-red-50 rounded mt-1">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ====== 5. LOOKBOOK ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">5. Lookbook</h2>
                <p className="text-sm text-muted-foreground mt-1">Gallery images shown in the lookbook strip</p>
              </div>
              <button type="button" onClick={addLookbookImage} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lookbookImages.map((img, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3 relative">
                  {img.file || (img.src && !img.src.startsWith('data:')) ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-2">
                      <Image src={img.file ? URL.createObjectURL(img.file) : img.src} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <label className="block aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-foreground transition-colors mb-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => handleLookbookImage(idx, e)} className="hidden" />
                    </label>
                  )}
                  <input type="text" value={img.alt} onChange={(e) => updateLookbookAlt(idx, e.target.value)}
                    className="w-full px-2 py-1 border border-border rounded text-xs outline-none"
                    placeholder="Alt text" />
                  {lookbookImages.length > 1 && (
                    <button type="button" onClick={() => removeLookbookImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ====== 6. PURCHASE POINTS ====== */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">6. Purchase Panel Points</h2>
              <p className="text-sm text-muted-foreground mt-1">3 points shown below the Buy Now button (icon, heading, text)</p>
            </div>

            <div className="space-y-4">
              {purchasePoints.map((point, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Icon</label>
                      <select value={point.icon} onChange={(e) => updatePurchasePoint(idx, 'icon', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none">
                        {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Heading</label>
                      <input type="text" value={point.heading} onChange={(e) => updatePurchasePoint(idx, 'heading', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                        placeholder="e.g. 60W Fast Charging" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Text</label>
                      <input type="text" value={point.text} onChange={(e) => updatePurchasePoint(idx, 'text', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none"
                        placeholder="e.g. USB‑C to USB‑C PD" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
