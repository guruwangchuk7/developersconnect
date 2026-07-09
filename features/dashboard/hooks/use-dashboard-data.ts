"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { toast } from "sonner"
import { FeedPost, Profile, Event as DashboardEvent, Connection, Notification } from "@/types"

import { PostsService } from "@/lib/services/posts.service"
import { ProfilesService } from "@/lib/services/profiles.service"
import { useProfile } from "@/providers/profile-provider"

export function useDashboardData() {
   const { user, profile, isLoading: isProfileLoading } = useProfile()
   const [isDataLoading, setIsDataLoading] = React.useState(true)
   const [activeTab, setActiveTabRaw] = React.useState<string>("all")

   const [posts, setPosts] = React.useState<FeedPost[]>([])
   const [allProfiles, setAllProfiles] = React.useState<Profile[]>([])
   const [myConnections, setMyConnections] = React.useState<any[]>([])
   const [notifications, setNotifications] = React.useState<Notification[]>([])
   const [pendingRequests, setPendingRequests] = React.useState<any[]>([])
   const [userLikes, setUserLikes] = React.useState<string[]>([])
   const [events, setEvents] = React.useState<DashboardEvent[]>([])
   const [isPosting, setIsPosting] = React.useState(false)
   const [discoverSearch, setDiscoverSearch] = React.useState("")

   const supabase = React.useMemo(() => createClient(), [])
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const isInitializing = isProfileLoading

   const setActiveTab = (tab: string) => {
      setActiveTabRaw(tab)
      const params = new URLSearchParams(searchParams?.toString())
      params.set("tab", tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
   }

   const fetchPosts = React.useCallback(async () => {
      try {
         const data = await PostsService.getAll(30)
         setPosts(data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            user: p.profiles?.full_name || 'Anonymous',
            role: p.profiles?.role || 'Developer',
            avatar_url: p.profiles?.avatar_url,
            timestamp: new Date(p.created_at).toLocaleDateString(),
            created_at: p.created_at,
            content: p.content,
            type: p.type,
            likes: p.likes_count || 0,
            comments: p.comments_count || 0,
            tags: p.tags || []
         })))
      } catch (e) {
         console.error("Posts sync failed", e)
      }
   }, [])

   const fetchEvents = React.useCallback(async () => {
      const { data } = await supabase
         .from('events')
         .select(`*, profiles!organizer_id (full_name)`)
         .order('event_date', { ascending: true })
      if (data) setEvents(data)
   }, [supabase])

   const fetchUserLikes = React.useCallback(async (userId: string) => {
      try {
         const likedPostIds = await PostsService.getUserLikes(userId)
         setUserLikes(likedPostIds)
      } catch (e) {
         console.error("Likes sync failed", e)
      }
   }, [])

   const fetchMyConnections = React.useCallback(async (userId: string) => {
      const { data } = await supabase
         .from('connections')
         .select(`*, 
            sender:profiles!sender_id(id, full_name, avatar_url, role),
            receiver:profiles!receiver_id(id, full_name, avatar_url, role)
         `)
         .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

      if (data) {
         setMyConnections(data)
         setPendingRequests(data.filter((c: any) => c.receiver_id === userId && c.status === 'PENDING'))
      }
   }, [supabase])

   const fetchNotifications = React.useCallback(async (userId: string) => {
      const { data } = await supabase
         .from('notifications')
         .select('*')
         .eq('user_id', userId)
         .order('created_at', { ascending: false })
      if (data) setNotifications(data)
   }, [supabase])

   const fetchAllProfiles = React.useCallback(async () => {
      try {
         const data = await ProfilesService.getAll(100)
         setAllProfiles(data)
      } catch (e) {
         console.error("Profiles sync failed", e)
      }
   }, [])

   const handleLike = async (postId: string) => {
      if (!user) return
      const isLiked = userLikes.includes(postId)
      try {
         if (isLiked) {
            setUserLikes(prev => prev.filter(id => id !== postId))
            await PostsService.unlike(postId, user.id)
         } else {
            setUserLikes(prev => [...prev, postId])
            await PostsService.like(postId, user.id)
         }
      } catch (e) {
         fetchUserLikes(user.id)
         fetchPosts()
      }
   }

   const handleConnect = async (targetUserId: string) => {
      if (!user || user.id === targetUserId) return
      const { error } = await supabase.from('connections').insert([{ sender_id: user.id, receiver_id: targetUserId, status: 'PENDING' }])
      if (!error) {
         await supabase.from('notifications').insert([{
            user_id: targetUserId, type: 'CONNECTION', actor_id: user.id,
            content: `${user.user_metadata?.full_name || 'A developer'} wants to connect with you.`,
            link: '/dashboard?tab=discover'
         }])
         fetchMyConnections(user.id)
         toast.success("Connection request sent!")
      } else {
         toast.error("Failed to send request")
      }
   }

   const handleCancelConnection = async (targetId: string) => {
      if (!user) return
      const { error } = await supabase.from('connections').delete().eq('status', 'PENDING').or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${user.id})`)
      if (!error) {
         await supabase.from('notifications').delete().eq('user_id', targetId).eq('actor_id', user.id).eq('type', 'CONNECTION')
         fetchMyConnections(user.id)
         toast.success("Request rescinded")
      }
   }

   const getConnectionStatus = (profileId: string) => {
      const conn = myConnections.find(c => c.sender_id === profileId || c.receiver_id === profileId)
      if (!conn) return 'NONE'
      if (conn.status === 'ACCEPTED') return 'CONNECTED'
      return conn.sender_id === user?.id ? 'PENDING_SENT' : 'PENDING_RECEIVED'
   }

   const handleDeletePost = async (postId: string) => {
      if (!window.confirm("Are you sure you want to delete this fragment?")) return
      try {
         await PostsService.delete(postId)
         setPosts(prev => prev.filter(p => p.id !== postId))
         toast.success("Fragment discarded")
      } catch (e) {
         toast.error("Failed to delete")
      }
   }

   const handleDeleteEvent = async (eventId: string) => {
      if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return
      try {
         const { error } = await supabase.from('events').delete().eq('id', eventId)
         if (!error) {
            setEvents(prev => prev.filter(e => e.id !== eventId))
            toast.success("Event removed from the grid")
         } else {
            toast.error("Failed to remove event")
         }
      } catch (e) {
         toast.error("Connection error")
      }
   }

   const handleUploadEventPoster = async (file: File): Promise<string | null> => {
      if (!user) return null

      try {
         // Client-side image compression + base64 conversion
         // This avoids needing a Supabase Storage bucket
         return await new Promise<string | null>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
               const img = new Image()
               img.onload = () => {
                  const canvas = document.createElement('canvas')
                  const MAX_SIZE = 800
                  let width = img.width
                  let height = img.height

                  if (width > height) {
                     if (width > MAX_SIZE) { height = (height * MAX_SIZE) / width; width = MAX_SIZE }
                  } else {
                     if (height > MAX_SIZE) { width = (width * MAX_SIZE) / height; height = MAX_SIZE }
                  }

                  canvas.width = width
                  canvas.height = height
                  const ctx = canvas.getContext('2d')
                  ctx?.drawImage(img, 0, 0, width, height)
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
                  resolve(dataUrl)
               }
               img.onerror = () => { toast.error("Invalid image file"); resolve(null) }
               img.src = e.target?.result as string
            }
            reader.onerror = () => { toast.error("Could not read the file"); resolve(null) }
            reader.readAsDataURL(file)
         })
      } catch (error) {
         console.error('Error processing image: ', error)
         toast.error("Failed to process image")
         return null
      }
   }

   const handleAcceptConnection = async (connectionId: string) => {
      const { error } = await supabase.from('connections').update({ status: 'ACCEPTED' }).eq('id', connectionId)
      if (!error && user) {
         toast.success("Connection accepted!")
         fetchMyConnections(user.id)
      }
   }

   const handleDeclineConnection = async (connectionId: string) => {
      const { error } = await supabase.from('connections').delete().eq('id', connectionId)
      if (!error && user) {
         toast.success("Request declined")
         fetchMyConnections(user.id)
      }
   }

   const handlePost = async (guidedFields: any, setGuidedFields: (fields: any) => void) => {
      if (!user) return

      const emptyFields = { blocker: "", stack: "", context: "", role: "", project: "", mission: "", projectName: "", description: "", link: "", eventTitle: "", eventVenue: "", eventDate: "", eventEndDate: "", eventDescription: "", eventPoster: "", updateImage: "", registrationDeadline: "", eventStartTime: "", eventEndTime: "" }

      if (activeTab === "organize-event") {
         if (!guidedFields.eventTitle?.trim()) return toast.error("Event title required")
         if (!guidedFields.eventVenue?.trim()) return toast.error("Event venue required")
         if (!guidedFields.eventDate?.trim()) return toast.error("Event date required")

         setIsPosting(true)
         let finalDescription = (guidedFields.eventDescription || "").trim();
         if (guidedFields.registrationDeadline) {
            finalDescription += `\nREGISTRATION_DEADLINE: ${guidedFields.registrationDeadline}`;
         }
         if (guidedFields.eventEndDate) {
            finalDescription += `\nEVENT_END_DATE: ${guidedFields.eventEndDate}`;
         }

         try {
            const { error } = await supabase.from('events').insert([{
               organizer_id: user.id,
               title: guidedFields.eventTitle.trim(),
               venue: guidedFields.eventVenue.trim(),
               event_date: guidedFields.eventDate || new Date().toISOString(),
               description: finalDescription,
               image_url: guidedFields.eventPoster?.trim() || null
            }])
            if (!error) {
               setGuidedFields(emptyFields);
               fetchEvents();
               setActiveTab("events");
               toast.success("Event broadcasted successfully")
            } else {
               toast.error("Broadcast failed")
            }
         } catch (e) {
            toast.error("Connection interrupted")
         } finally {
            setIsPosting(false)
         }
         return
      }

      const configs: Record<string, { content: string, type: string, label: string }> = {
         "post-update": { content: (guidedFields.blocker || "") + (guidedFields.updateImage ? `\nIMAGE: ${guidedFields.updateImage}` : ""), type: "UPDATE", label: "Update" },
         "ask-help": { content: `BLOCKER: ${guidedFields.blocker}\nSTACK: ${guidedFields.stack}\nCONTEXT: ${guidedFields.context}`, type: "HELP", label: "Help request" },
         "dev-needed": { content: `ROLE NEEDED: ${guidedFields.role}\nPROJECT: ${guidedFields.project}\nMISSION: ${guidedFields.mission}`, type: "TEAM", label: "Team search" },
         "share-project": { content: `PROJECT: ${guidedFields.projectName}\nDESCRIPTION: ${guidedFields.description}\nLINK: ${guidedFields.link}`, type: "PROJECT", label: "Project launch" }
      }

      const config = configs[activeTab]
      if (!config) return

      // Specific validation for content types
      if (activeTab === "post-update" && !guidedFields.blocker?.trim()) return toast.error("Update content required")
      if (activeTab === "ask-help" && !guidedFields.blocker?.trim()) return toast.error("Blocker description required")
      if (activeTab === "dev-needed" && !guidedFields.role?.trim()) return toast.error("Role description required")
      if (activeTab === "share-project" && !guidedFields.projectName?.trim()) return toast.error("Project name required")

      setIsPosting(true)
      try {
         // Extract tags from hashtags in content + optional comma-separated tags field
         const hashTags = config.content.match(/#\w+/g)?.map(t => t.slice(1)) || []
         const manualTags = (guidedFields.stack || "").split(',').map((t: string) => t.trim()).filter(Boolean)
         const allTags = [...new Set([...hashTags, ...manualTags])]

         const { error } = await supabase.from('posts').insert([{
            user_id: user.id,
            type: config.type,
            content: config.content.trim(),
            tags: allTags
         }])
         if (!error) {
            setGuidedFields(emptyFields);
            fetchPosts();
            setActiveTab("all");
            toast.success(`${config.label} synchronized successfully`)
         } else {
            toast.error("Sync failed")
         }
      } catch (e) {
         toast.error("Network error")
      } finally {
         setIsPosting(false)
      }
   }

   React.useEffect(() => {
      const tab = searchParams?.get("tab")
      if (tab && tab !== activeTab) {
         setActiveTabRaw(tab)
      }
   }, [searchParams])

   React.useEffect(() => {
      if (!user) return

      async function initData() {
         await Promise.all([
            fetchPosts(),
            fetchEvents(),
            fetchUserLikes(user!.id),
            fetchMyConnections(user!.id),
            fetchNotifications(user!.id),
            fetchAllProfiles()
         ])

         setIsDataLoading(false)

         const interval = setInterval(() => {
            fetchPosts()
            fetchEvents()
         }, 30000)

         return () => clearInterval(interval)
      }

      initData()
   }, [user, fetchPosts, fetchEvents, fetchUserLikes, fetchMyConnections, fetchNotifications, fetchAllProfiles])

   return {
      user,
      profile,
      isInitializing,
      isDataLoading,
      activeTab,
      setActiveTab,
      posts,
      setPosts,
      allProfiles,
      myConnections,
      notifications,
      pendingRequests,
      userLikes,
      setUserLikes,
      events,
      isPosting,
      setIsPosting,
      discoverSearch,
      setDiscoverSearch,
      handleLike,
      handleConnect,
      handleCancelConnection,
      getConnectionStatus,
      handleDeletePost,
      handleAcceptConnection,
      handleDeclineConnection,
      handlePost,
      handleDeleteEvent,
      handleUploadEventPoster,
      supabase,
      router,
      fetchPosts,
      fetchEvents,
      fetchMyConnections,
      fetchUserLikes
   }
}
