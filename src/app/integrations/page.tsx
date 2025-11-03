"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  CheckCircle2,
  Circle,
  Facebook,
  Instagram,
  Chrome,
  Search,
  Mail,
  ShoppingBag,
  Globe,
  Plus,
  Settings,
  ExternalLink,
  AlertCircle
} from "lucide-react"

type Integration = {
  id: string
  name: string
  description: string
  icon: any
  category: "social" | "google" | "marketing" | "other"
  connected: boolean
  status?: "active" | "error" | "pending"
  lastSync?: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "facebook-pixel",
      name: "Facebook Pixel",
      description: "Track conversions, optimize ads, and build targeted audiences",
      icon: Facebook,
      category: "social",
      connected: false,
    },
    {
      id: "meta-business",
      name: "Meta Business Suite",
      description: "Manage Facebook & Instagram ad campaigns",
      icon: Instagram,
      category: "social",
      connected: false,
    },
    {
      id: "google-account",
      name: "Google Account",
      description: "Connect for product syncing and analytics",
      icon: Chrome,
      category: "google",
      connected: false,
    },
    {
      id: "google-business",
      name: "Google Business Profile",
      description: "Manage your business listing and reviews",
      icon: ShoppingBag,
      category: "google",
      connected: false,
    },
    {
      id: "google-search-console",
      name: "Google Search Console",
      description: "Monitor website performance in Google Search",
      icon: Search,
      category: "google",
      connected: false,
    },
    {
      id: "google-merchant",
      name: "Google Merchant Center",
      description: "Sync products to Google Shopping",
      icon: ShoppingBag,
      category: "google",
      connected: false,
    },
    {
      id: "email-service",
      name: "Email Service Provider",
      description: "Connect for automated email campaigns (SendGrid/Mailgun)",
      icon: Mail,
      category: "marketing",
      connected: false,
    },
  ])

  const handleConnect = (integrationId: string) => {
    // TODO: Implement actual OAuth connection flow
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId
          ? { ...int, connected: true, status: "active", lastSync: new Date().toISOString() }
          : int
      )
    )
  }

  const handleDisconnect = (integrationId: string) => {
    // TODO: Implement disconnect logic
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId ? { ...int, connected: false, status: undefined, lastSync: undefined } : int
      )
    )
  }

  const getCategoryIntegrations = (category: string) => {
    return integrations.filter((int) => int.category === category)
  }

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <integration.icon className="w-6 h-6 text-neutral-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">{integration.name}</h3>
            <p className="text-sm text-neutral-600">{integration.description}</p>
          </div>
        </div>
        <div>
          {integration.connected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400">
              <Circle className="w-5 h-5" />
              <span className="text-sm font-medium">Not connected</span>
            </div>
          )}
        </div>
      </div>

      {integration.connected && integration.lastSync && (
        <div className="mb-4 text-xs text-neutral-500">
          Last synced: {new Date(integration.lastSync).toLocaleString()}
        </div>
      )}

      <div className="flex gap-3">
        {!integration.connected ? (
          <button
            onClick={() => handleConnect(integration.id)}
            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Connect
          </button>
        ) : (
          <>
            <button
              onClick={() => handleDisconnect(integration.id)}
              className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
            >
              Disconnect
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Integrations</h1>
              <p className="text-sm text-neutral-600">Connect your accounts and services</p>
            </div>
            <Link
              href="/integrations/setup-guide"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Setup Guide
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">Integration Setup Required</p>
            <p className="text-sm text-blue-700">
              Connect your accounts to enable features like ad tracking, product syncing, and automated emails. Check
              the Setup Guide for step-by-step instructions.
            </p>
          </div>
        </motion.div>

        {/* Facebook & Instagram Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Facebook className="w-6 h-6" />
            Facebook & Instagram
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getCategoryIntegrations("social").map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>

        {/* Google Services Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Chrome className="w-6 h-6" />
            Google Services
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getCategoryIntegrations("google").map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>

        {/* Marketing & Email Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Marketing & Email
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getCategoryIntegrations("marketing").map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
