"use client"

import { Fragment, useState, useEffect, useMemo, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import {
  Search,
  Eye,
  Download,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { getOrders, updateOrderStatus, getOrderStats } from "@/lib/services/orders"
import { OrderWithDetails } from "@/lib/types/database"

const statusConfig = {
  pending: { color: "bg-neutral-100 text-neutral-700 border-neutral-200", icon: Clock, label: "Pending" },
  processing: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Package, label: "Processing" },
  shipped: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Cancelled" },
}

/** Flagged but never booked — waiting on a courier decision from you. */
const COURIER_TAB = "needs-courier"
/** Booked, but the delivery ran into trouble. */
const DELIVERY_TAB = "delivery-issue"

const ALERT_TABS: string[] = [COURIER_TAB, DELIVERY_TAB]

const TABS = [
  { key: "All", label: "All" },
  { key: "pending", label: "Pending" },
  { key: COURIER_TAB, label: "Courier needed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  // Sits between Shipped and Delivered on purpose: these left us but are not
  // going to arrive — returned, refused, or stuck under review.
  { key: DELIVERY_TAB, label: "Not arriving" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const

const BULK_STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const

const ITEMS_PER_PAGE = 50

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("pending")
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [syncingAll, setSyncingAll] = useState(false)
  const [lastDataLoad, setLastDataLoad] = useState<string | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)
  const [stats, setStats] = useState<Record<string, number>>({
    all: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
    "needs-courier": 0, "delivery-issue": 0,
  })

  // Shopify-style multi-select
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadOrders()
    // Changing tab or search invalidates the current selection.
    setSelected(new Set())
    setExpanded(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, searchQuery])

  useEffect(() => {
    loadStats()
  }, [lastDataLoad])

  // Header checkbox shows a dash when only some rows are ticked.
  useEffect(() => {
    if (!selectAllRef.current) return
    const count = orders.filter((o) => selected.has(o.id)).length
    selectAllRef.current.indeterminate = count > 0 && count < orders.length
  }, [selected, orders])

  const loadStats = async () => {
    const { data } = await getOrderStats()
    if (data) setStats(data)
  }

  const loadOrders = async () => {
    setLoading(true)
    const { data, count, error } = await getOrders({
      status: selectedStatus,
      search: searchQuery,
      limit: ITEMS_PER_PAGE,
      offset: 0,
      attention: ALERT_TABS.includes(selectedStatus)
        ? (selectedStatus as "needs-courier" | "delivery-issue")
        : undefined,
    })

    if (error) {
      console.error("Failed to load orders:", error)
      toast.error("Failed to load orders")
    } else if (data) {
      setOrders(data)
      setTotalOrders(count || 0)
      setLastDataLoad(new Date().toISOString())
    }
    setLoading(false)
  }

  const loadMoreOrders = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    const { data, error } = await getOrders({
      status: selectedStatus,
      search: searchQuery,
      limit: ITEMS_PER_PAGE,
      offset: orders.length,
      attention: ALERT_TABS.includes(selectedStatus)
        ? (selectedStatus as "needs-courier" | "delivery-issue")
        : undefined,
    })

    if (error) {
      toast.error("Failed to load more orders")
    } else if (data) {
      setOrders((prev) => [...prev, ...data])
    }
    setLoadingMore(false)
  }

  /** An order can only be marked shipped once it has courier + tracking number. */
  const canShip = (order: OrderWithDetails) => Boolean(order.tracking_number && order.courier)

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId)

    if (newStatus === "shipped" && order && !canShip(order)) {
      toast.error("Tracking details required", {
        description: "Add a courier and tracking number before marking this order shipped.",
      })
      return
    }

    setUpdatingOrderId(orderId)
    const { error, postex } = await updateOrderStatus(orderId, newStatus)

    if (error) {
      toast.error("Could not update order", { description: error })
    } else {
      const label = order?.order_number ?? "Order"

      if (postex?.ok && postex.trackingNumber) {
        toast.success(`${label} booked with PostEx`, {
          description: `Tracking ${postex.trackingNumber}`,
        })
      } else if (postex?.needsOtherCourier) {
        toast.warning(`${label} needs another courier`, {
          description: postex.reason,
        })
      } else if (postex && !postex.ok) {
        toast.warning(`${label} marked ${newStatus}, but PostEx booking failed`, {
          description: postex.reason,
        })
      } else {
        toast.success(`${label} marked ${newStatus}`)
      }

      await loadOrders()
    }
    setUpdatingOrderId(null)
  }

  const handleBulkStatus = async (newStatus: string) => {
    const chosen = orders.filter((o) => selected.has(o.id))
    if (chosen.length === 0) return

    // Orders missing tracking can't ship — skip them rather than failing the batch.
    const eligible = newStatus === "shipped" ? chosen.filter(canShip) : chosen
    const skipped = chosen.length - eligible.length

    if (eligible.length === 0) {
      toast.error("Nothing to update", {
        description: "None of the selected orders have a courier and tracking number yet.",
      })
      return
    }

    setBulkBusy(true)
    const failures: string[] = []
    let booked = 0
    let needsCourier = 0
    let bookingFailed = 0

    // Sequential on purpose: each update also writes stock, books with PostEx
    // and fires notifications.
    for (const order of eligible) {
      const { error, postex } = await updateOrderStatus(order.id, newStatus)
      if (error) {
        failures.push(order.order_number)
        continue
      }
      if (postex?.ok && postex.trackingNumber) booked += 1
      else if (postex?.needsOtherCourier) needsCourier += 1
      else if (postex && !postex.ok) bookingFailed += 1
    }

    setBulkBusy(false)
    setSelected(new Set())
    await loadOrders()

    const done = eligible.length - failures.length

    // One summary line beats twenty toasts.
    const notes: string[] = []
    if (booked > 0) notes.push(`${booked} booked with PostEx`)
    if (needsCourier > 0) notes.push(`${needsCourier} need another courier`)
    if (bookingFailed > 0) notes.push(`${bookingFailed} booking failed`)
    if (skipped > 0) notes.push(`${skipped} skipped — no tracking details`)

    if (failures.length === 0) {
      toast.success(`${done} order${done === 1 ? "" : "s"} marked ${newStatus}`, {
        description: notes.length > 0 ? notes.join(" · ") : undefined,
      })
    } else {
      toast.error(`${failures.length} of ${eligible.length} failed`, {
        description: `Could not update: ${failures.join(", ")}`,
      })
    }
  }

  /**
   * Pull the latest status for every in-flight PostEx order.
   *
   * The webhook normally keeps things current on its own; this is here so you
   * are never waiting on the once-daily scheduled sweep (all the Vercel Hobby
   * plan allows) if a push was ever missed.
   */
  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      const response = await fetch("/api/postex/sync", { method: "POST" })
      const result = await response.json()

      if (result.ok) {
        toast.success(
          result.checked === 0
            ? "Nothing in transit to check"
            : `Checked ${result.checked} order${result.checked === 1 ? "" : "s"}`,
          { description: result.updated > 0 ? `${result.updated} updated` : "No changes" }
        )
        await loadOrders()
      } else {
        toast.error("Sync failed", { description: result.error })
      }
    } catch {
      toast.error("Could not reach PostEx")
    }
    setSyncingAll(false)
  }

  /** Try booking again after fixing whatever PostEx complained about. */
  const handleRetryBooking = async (order: OrderWithDetails) => {
    setUpdatingOrderId(order.id)
    try {
      const response = await fetch("/api/postex/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
      const result = await response.json()

      if (result.ok && result.trackingNumber) {
        toast.success(`${order.order_number} booked with PostEx`, {
          description: `Tracking ${result.trackingNumber}`,
        })
      } else if (result.needsOtherCourier) {
        toast.warning("PostEx still doesn't deliver there", {
          description: result.suggestions?.length
            ? `Closest matches: ${result.suggestions.slice(0, 3).join(", ")}`
            : result.reason,
        })
      } else {
        toast.error("Booking failed again", { description: result.reason })
      }
      await loadOrders()
    } catch {
      toast.error("Could not reach the booking service")
    }
    setUpdatingOrderId(null)
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allOnPageSelected = orders.length > 0 && orders.every((o) => selected.has(o.id))

  const toggleSelectAll = () => {
    setSelected(allOnPageSelected ? new Set() : new Set(orders.map((o) => o.id)))
  }

  const selectedOrders = useMemo(
    () => orders.filter((o) => selected.has(o.id)),
    [orders, selected]
  )

  const exportToCSV = (ordersToExport: OrderWithDetails[], label: string) => {
    if (ordersToExport.length === 0) {
      toast.error("Nothing to export")
      return
    }

    const headers = [
      "Order Number", "Customer Name", "Phone", "Email", "Address", "City", "Province",
      "Postal Code", "Items", "Total", "Payment Method", "Status", "Created At",
      "Tracking Number", "Carrier", "Customer Confirmed", "Confirmation Query",
    ]

    const csvData = ordersToExport.map((order) => {
      const items = order.order_items
        ?.map((item) => `${item.quantity}x ${item.product_name}${item.variant_details ? ` (${item.variant_details})` : ""}`)
        .join("; ") || ""

      return [
        order.order_number, order.shipping_name, order.shipping_phone, order.user_email || "",
        order.shipping_address, order.shipping_city, order.shipping_province,
        order.shipping_postal_code || "", items, order.total, order.payment_method.toUpperCase(),
        order.status, new Date(order.created_at).toLocaleString(), order.tracking_number || "",
        order.courier || "", order.customer_confirmed ? "Yes" : "No", order.confirmation_query || "",
      ]
    })

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `orders_${label}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${ordersToExport.length} order${ordersToExport.length === 1 ? "" : "s"}`)
  }

  const shownCount =
    selectedStatus.toLowerCase() === "all"
      ? stats.all
      : stats[selectedStatus.toLowerCase()] ?? 0

  const emptyMessage =
    selectedStatus === COURIER_TAB
      ? "Nothing waiting on a courier — every order booked with PostEx"
      : selectedStatus === DELIVERY_TAB
      ? "Everything in transit is on track"
      : searchQuery
      ? "Try a different search"
      : "Nothing here yet"

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Orders</h1>
            <p className="text-xs text-neutral-500">{stats.all} orders total</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              title="Check PostEx for status updates on everything in transit"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncingAll ? "animate-spin" : ""}`} />
              Sync PostEx
            </button>
            <button
              onClick={() => exportToCSV(orders, selectedStatus.toLowerCase())}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const count = tab.key === "All" ? stats.all : stats[tab.key] ?? 0
            const active = selectedStatus === tab.key
            const isAttention = ALERT_TABS.includes(tab.key)
            // Always render the alert tabs, even at zero. Hiding them made it
            // impossible to tell whether they existed at all.
            const quiet = isAttention && count === 0
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`relative px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "text-neutral-900 font-semibold"
                    : quiet
                    ? "text-neutral-400 hover:text-neutral-600"
                    : isAttention
                    ? "text-red-600 font-medium hover:text-red-700"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] ${
                    active
                      ? isAttention && count > 0
                        ? "bg-red-600 text-white"
                        : "bg-neutral-900 text-white"
                      : quiet
                      ? "bg-neutral-100 text-neutral-400"
                      : isAttention
                      ? "bg-red-100 text-red-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
                {active && (
                  <motion.div
                    layoutId="orders-tab-underline"
                    className="absolute left-2 right-2 -bottom-px h-0.5 bg-neutral-900 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-5">
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search order number, name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none"
          />
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="sticky top-[104px] z-20 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white shadow-lg"
            >
              <span className="text-sm font-medium mr-1">
                {selected.size} selected
              </span>

              <span className="text-xs text-neutral-400 mr-1">Mark as</span>
              {BULK_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleBulkStatus(status)}
                  disabled={bulkBusy}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors capitalize"
                >
                  {status}
                </button>
              ))}

              <div className="w-px h-5 bg-white/20 mx-1" />

              <button
                onClick={() => exportToCSV(selectedOrders, "selected")}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <button
                onClick={() => setSelected(new Set())}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-white/10 disabled:opacity-50 transition-colors ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>

              {bulkBusy && <Loader2 className="w-4 h-4 animate-spin ml-1" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">No orders found</h3>
              <p className="text-sm text-neutral-500">{emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    <th className="w-10 pl-4 py-2.5">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all orders"
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                      />
                    </th>
                    <th className="w-8" />
                    <th className="px-3 py-2.5">Order</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">City</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                    <th className="px-3 py-2.5">Confirmed</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order) => {
                    const statusKey = order.status.toLowerCase() as keyof typeof statusConfig
                    const config = statusConfig[statusKey] || statusConfig.pending
                    const StatusIcon = config.icon
                    const isSelected = selected.has(order.id)
                    const isExpanded = expanded.has(order.id)
                    const itemCount = order.order_items?.reduce((n, i) => n + i.quantity, 0) ?? 0

                    return (
                      <Fragment key={order.id}>
                        <tr
                          className={`transition-colors ${
                            isSelected ? "bg-neutral-50" : "hover:bg-neutral-50/60"
                          }`}
                        >
                          <td className="pl-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(order.id)}
                              aria-label={`Select ${order.order_number}`}
                              className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              aria-label={isExpanded ? "Hide details" : "Show details"}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            <Link
                              href={`/orders/${order.id}`}
                              className="font-semibold text-neutral-900 hover:underline"
                            >
                              {order.order_number}
                            </Link>
                            <div className="text-xs text-neutral-500">
                              {itemCount} item{itemCount === 1 ? "" : "s"}
                            </div>
                            {order.postex_needs_attention && (
                              <div className="mt-0.5 flex items-start gap-1 text-xs text-red-600 max-w-[220px]">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                                <span>{order.postex_attention_reason || "Needs attention"}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-neutral-600 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                            <div className="text-xs text-neutral-400">
                              {new Date(order.created_at).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="text-neutral-900">{order.shipping_name}</div>
                            <div className="text-xs text-neutral-500">{order.shipping_phone}</div>
                          </td>
                          <td className="px-3 py-2.5 text-neutral-600">{order.shipping_city}</td>
                          <td className="px-3 py-2.5 text-right font-medium text-neutral-900 whitespace-nowrap">
                            Rs. {Number(order.total).toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5">
                            {order.customer_confirmed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Yes
                              </span>
                            ) : order.confirmation_query ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700">
                                <MessageCircle className="w-3.5 h-3.5" />
                                Query
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${config.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {updatingOrderId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-neutral-300 rounded-md bg-white hover:bg-neutral-50 outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              )}
                              {order.postex_needs_attention && !order.tracking_number && (
                                <button
                                  onClick={() => handleRetryBooking(order)}
                                  disabled={updatingOrderId === order.id}
                                  title="Try booking with PostEx again"
                                  className="p-1.5 rounded-md border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <Link
                                href={`/orders/${order.id}`}
                                aria-label={`View ${order.order_number}`}
                                className="p-1.5 rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded detail row — saves opening the order page */}
                        {isExpanded && (
                          <tr className="bg-neutral-50/80">
                            <td />
                            <td />
                            <td colSpan={8} className="px-3 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                <div>
                                  <p className="font-semibold text-neutral-700 mb-1.5">Items</p>
                                  {order.order_items?.map((item) => (
                                    <p key={item.id} className="text-neutral-600">
                                      {item.quantity}× {item.product_name}
                                      {item.variant_details && (
                                        <span className="text-neutral-400"> ({item.variant_details})</span>
                                      )}
                                    </p>
                                  ))}
                                  <p className="mt-1.5 text-neutral-500">
                                    Payment: {order.payment_method.toUpperCase()}
                                  </p>
                                </div>

                                <div>
                                  <p className="font-semibold text-neutral-700 mb-1.5">Shipping</p>
                                  <p className="text-neutral-600">{order.shipping_address}</p>
                                  <p className="text-neutral-600">
                                    {order.shipping_city}, {order.shipping_province}
                                  </p>
                                  {order.user_email && (
                                    <p className="text-neutral-500 mt-1.5">{order.user_email}</p>
                                  )}
                                </div>

                                <div>
                                  <p className="font-semibold text-neutral-700 mb-1.5">Tracking</p>
                                  {order.courier || order.tracking_number ? (
                                    <>
                                      <p className="text-neutral-600">{order.courier || "—"}</p>
                                      <p className="text-neutral-600 font-mono">
                                        {order.tracking_number || "—"}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-neutral-400">Not added yet</p>
                                  )}
                                  {order.postex_status && (
                                    <p className="text-neutral-500 mt-1">
                                      PostEx: {order.postex_status}
                                    </p>
                                  )}
                                  {order.postex_last_error && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                      <p className="font-semibold text-red-900">Courier problem</p>
                                      <p className="text-red-800">{order.postex_last_error}</p>
                                    </div>
                                  )}
                                  {order.confirmation_query && (
                                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                      <p className="font-semibold text-orange-900">Customer query</p>
                                      <p className="text-orange-800">{order.confirmation_query}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer / pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center justify-between mt-4 pb-8">
            <p className="text-xs text-neutral-500">
              Showing {orders.length} of {shownCount}
            </p>
            {orders.length < totalOrders && (
              <button
                onClick={loadMoreOrders}
                disabled={loadingMore}
                className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-2 font-medium"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
