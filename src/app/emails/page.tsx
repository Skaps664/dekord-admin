"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Mail,
  Send,
  Clock,
  Users,
  ShoppingCart,
  Package,
  X as XIcon,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2
} from "lucide-react"

type EmailAutomation = {
  id: string
  name: string
  trigger: "order_placed" | "order_fulfilled" | "order_cancelled" | "abandoned_cart" | "welcome" | "custom"
  subject: string
  enabled: boolean
  sentCount: number
  openRate: number
  clickRate: number
}

type EmailCampaign = {
  id: string
  name: string
  subject: string
  status: "draft" | "scheduled" | "sent"
  recipients: number
  scheduledDate?: string
  sentDate?: string
  openRate?: number
  clickRate?: number
}

export default function EmailAutomationsPage() {
  const [activeTab, setActiveTab] = useState<"automations" | "campaigns">("automations")

  const [automations, setAutomations] = useState<EmailAutomation[]>([
    {
      id: "1",
      name: "Order Confirmation",
      trigger: "order_placed",
      subject: "Your order has been received - Order #{order_id}",
      enabled: true,
      sentCount: 156,
      openRate: 89.5,
      clickRate: 12.3,
    },
    {
      id: "2",
      name: "Order Shipped",
      trigger: "order_fulfilled",
      subject: "Your order is on the way! 📦",
      enabled: true,
      sentCount: 142,
      openRate: 92.1,
      clickRate: 45.6,
    },
    {
      id: "3",
      name: "Order Cancelled",
      trigger: "order_cancelled",
      subject: "Your order has been cancelled",
      enabled: true,
      sentCount: 8,
      openRate: 78.3,
      clickRate: 5.2,
    },
    {
      id: "4",
      name: "Abandoned Cart Recovery",
      trigger: "abandoned_cart",
      subject: "You left something behind! 🛒",
      enabled: false,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
    },
    {
      id: "5",
      name: "Welcome Email",
      trigger: "welcome",
      subject: "Welcome to dekord! Defy Ordinary 🚀",
      enabled: true,
      sentCount: 234,
      openRate: 76.4,
      clickRate: 34.2,
    },
  ])

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Black Friday Sale 2025",
      subject: "🔥 25% OFF Everything - Black Friday Special!",
      status: "scheduled",
      recipients: 1234,
      scheduledDate: "2025-11-29T08:00:00",
    },
    {
      id: "2",
      name: "New Product Launch",
      subject: "Introducing dekord W-100 Pro ⚡",
      status: "sent",
      recipients: 1150,
      sentDate: "2025-11-01T10:00:00",
      openRate: 68.2,
      clickRate: 23.4,
    },
  ])

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) => (auto.id === id ? { ...auto, enabled: !auto.enabled } : auto))
    )
  }

  const handleDeleteAutomation = (id: string) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      setAutomations(automations.filter((a) => a.id !== id))
    }
  }

  const handleDeleteCampaign = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setCampaigns(campaigns.filter((c) => c.id !== id))
    }
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case "order_placed":
        return <ShoppingCart className="w-5 h-5" />
      case "order_fulfilled":
        return <Package className="w-5 h-5" />
      case "order_cancelled":
        return <XIcon className="w-5 h-5" />
      case "abandoned_cart":
        return <ShoppingCart className="w-5 h-5" />
      case "welcome":
        return <Users className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case "order_placed":
        return "Order Placed"
      case "order_fulfilled":
        return "Order Fulfilled"
      case "order_cancelled":
        return "Order Cancelled"
      case "abandoned_cart":
        return "Abandoned Cart"
      case "welcome":
        return "User Signup"
      default:
        return "Custom"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Email Marketing</h1>
                <p className="text-sm text-neutral-600">Automations & campaigns</p>
              </div>
            </div>
            <Link
              href={activeTab === "automations" ? "/emails/automation/new" : "/emails/campaign/new"}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {activeTab === "automations" ? "New Automation" : "New Campaign"}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("automations")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "automations"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Automations
            </div>
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "campaigns"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Campaigns
            </div>
          </button>
        </div>

        {/* Automations Tab */}
        {activeTab === "automations" && (
          <div className="space-y-4">
            {automations.map((automation, index) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getTriggerIcon(automation.trigger)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{automation.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getTriggerLabel(automation.trigger)}
                        </span>
                        {automation.enabled ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <Power className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                            <PowerOff className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600 mb-3">
                        <strong>Subject:</strong> {automation.subject}
                      </p>
                      <div className="flex gap-6 text-sm text-neutral-600">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Sent</p>
                          <p className="font-semibold text-neutral-900">{automation.sentCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Open Rate</p>
                          <p className="font-semibold text-neutral-900">{automation.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Click Rate</p>
                          <p className="font-semibold text-neutral-900">{automation.clickRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        automation.enabled
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {automation.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <Link
                      href={`/emails/automation/${automation.id}/edit`}
                      className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteAutomation(automation.id)}
                      className="p-2 text-neutral-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3">
                      <strong>Subject:</strong> {campaign.subject}
                    </p>
                    <div className="flex gap-6 text-sm text-neutral-600">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Recipients</p>
                        <p className="font-semibold text-neutral-900">{campaign.recipients.toLocaleString()}</p>
                      </div>
                      {campaign.status === "scheduled" && campaign.scheduledDate && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Scheduled For</p>
                          <p className="font-semibold text-neutral-900">
                            {new Date(campaign.scheduledDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {campaign.status === "sent" && (
                        <>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Open Rate</p>
                            <p className="font-semibold text-neutral-900">{campaign.openRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Click Rate</p>
                            <p className="font-semibold text-neutral-900">{campaign.clickRate}%</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/emails/campaign/${campaign.id}/edit`}
                      className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-neutral-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
