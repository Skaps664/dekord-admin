"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save,
  Upload,
  Image as ImageIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General
    siteName: "dekord",
    siteTagline: "Premium Charging Cables in Pakistan",
    siteDescription: "Pakistan's first premium charging accessories brand focusing on durability, performance, and trust.",
    
    // Contact
    email: "support@dekord.online",
    phone: "+92 339 0166442",
    whatsapp: "+92 339 0166442",
    address: "A2 Third Floor, New Dil Jan Plaza, Achini Ring Rd, Peshawar 25000",
    
    // Social Media
    facebook: "",
    instagram: "",
    linkedin: "",
    
    // Shipping
    shippingFee: "200",
    freeShippingThreshold: "5000",
    deliveryTime: "3-5 business days",
    
    // Business
    companyName: "dekord (SMC-Private) Limited",
    ceo: "M. Sudais Khan",
    gstNumber: "",
    ntnNumber: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Settings updated:", settings)
    // Handle settings update
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            </div>
            <button 
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Logo & Images */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">Logo & Images</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Site Logo
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Upload Logo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG (recommended: 200x60)
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Favicon
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Upload Favicon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG or ICO (32x32)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-6 h-6 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Facebook className="w-6 h-6 text-foreground" />
              <h2 className="text-xl font-bold text-foreground">Social Media</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Facebook URL
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    placeholder="https://facebook.com/dekord"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instagram URL
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    placeholder="https://instagram.com/dekord"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    value={settings.linkedin}
                    onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/dekord"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Shipping Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Standard Shipping Fee (Rs.)
                </label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Free Shipping Threshold (Rs.)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={settings.deliveryTime}
                  onChange={(e) => setSettings({ ...settings, deliveryTime: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CEO / Founder
                </label>
                <input
                  type="text"
                  value={settings.ceo}
                  onChange={(e) => setSettings({ ...settings, ceo: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={settings.gstNumber}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  NTN Number (Optional)
                </label>
                <input
                  type="text"
                  value={settings.ntnNumber}
                  onChange={(e) => setSettings({ ...settings, ntnNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
