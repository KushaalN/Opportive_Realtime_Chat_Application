import React, { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Users,
  MessageCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  gender?: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: User;
};

type Conversation = {
  id: string;
  participants: User[];
  last_message?: Message;
  updated_at: string;
};

export default function ChatDashboard() {
  const { user, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || "",
    username: user?.username || "",
    phoneNumber: user?.phone_number || "",
    gender: user?.gender || "male",
  });
  const [profileError, setProfileError] = useState("");

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, email, gender")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq("id", user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Start a conversation with a user
  const startConversation = async (otherUser: User) => {
    try {
      // Check if conversation already exists
      const { data: existingConversations, error: fetchError } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation_id,
          conversations!inner(*),
          users!inner(id, username, full_name, email)
        `,
        )
        .eq("user_id", user?.id);

      if (fetchError) throw fetchError;

      // Find existing conversation with this user
      let existingConversation = null;
      for (const conv of existingConversations || []) {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id);

        if (
          participants?.length === 2 &&
          participants.some((p) => p.user_id === otherUser.id)
        ) {
          existingConversation = conv;
          break;
        }
      }

      if (existingConversation) {
        // Load existing conversation
        loadConversation(existingConversation.conversation_id);
        return;
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: newConv.id, user_id: user?.id },
          { conversation_id: newConv.id, user_id: otherUser.id },
        ]);

      if (participantError) throw participantError;

      // Load the new conversation
      loadConversation(newConv.id);
      setSearchQuery("");
      setSearchResults([]);

      toast({
        title: "Success",
        description: `Started conversation with ${otherUser.username}`,
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  // Load conversation messages
  const loadConversation = async (conversationId: string) => {
    try {
      // Get conversation details with participants
      const { data: participants, error: participantError } = await supabase
        .from("conversation_participants")
        .select(
          `
          users!inner(id, username, full_name, email)
        `,
        )
        .eq("conversation_id", conversationId);

      if (participantError) throw participantError;

      const conversation: Conversation = {
        id: conversationId,
        participants: participants?.map((p) => p.users) || [],
        updated_at: new Date().toISOString(),
      };

      setActiveConversation(conversation);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          sender_id,
          created_at,
          users!sender_id(id, username, full_name, email)
        `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      const formattedMessages =
        messagesData?.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          sender: msg.users,
        })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      // Reload messages
      loadConversation(activeConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Load user's conversations
  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation_id,
          conversations!inner(*)
        `,
        )
        .eq("user_id", user.id);

      if (error) throw error;

      // For each conversation, get participants and last message
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select(
              `
              users!inner(id, username, full_name, email)
            `,
            )
            .eq("conversation_id", conv.conversation_id);

          const { data: lastMessage } = await supabase
            .from("messages")
            .select(
              `
              id,
              content,
              sender_id,
              created_at,
              users!sender_id(username)
            `,
            )
            .eq("conversation_id", conv.conversation_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            id: conv.conversation_id,
            participants: participants?.map((p) => p.users) || [],
            last_message: lastMessage
              ? {
                  id: lastMessage.id,
                  content: lastMessage.content,
                  sender_id: lastMessage.sender_id,
                  created_at: lastMessage.created_at,
                  sender: lastMessage.users,
                }
              : undefined,
            updated_at: conv.conversations.updated_at,
          };
        }),
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.full_name || "",
        username: user.username || "",
        phoneNumber: user.phone_number || "",
        gender: user.gender || "male",
      });
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");

    // Basic validation
    if (profileForm.username.length < 3) {
      setProfileError("Username must be at least 3 characters long");
      return;
    }

    if (profileForm.fullName.trim().length < 2) {
      setProfileError("Full name must be at least 2 characters long");
      return;
    }

    try {
      await updateProfile(
        profileForm.fullName.trim(),
        profileForm.username.trim(),
        profileForm.phoneNumber.trim() || undefined,
        profileForm.gender,
      );

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsProfileDialogOpen(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      setProfileError(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[1200px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="font-medium text-xl">ChatConnect</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}
            </span>
            <Dialog
              open={isProfileDialogOpen}
              onOpenChange={setIsProfileDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-username">Username</Label>
                    <Input
                      id="profile-username"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          username: e.target.value,
                        })
                      }
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-fullname">Full Name</Label>
                    <Input
                      id="profile-fullname"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <Input
                      id="profile-phone"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-gender">Gender</Label>
                    <Select
                      value={profileForm.gender}
                      onValueChange={(value) =>
                        setProfileForm({ ...profileForm, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {profileError && (
                    <p className="text-sm text-red-500">{profileError}</p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProfileDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/${user?.gender === "female" ? "avataaars" : "male"}/svg?seed=${user?.email}`}
                alt={user?.username || ""}
              />
              <AvatarFallback>
                {user?.username?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="pt-12 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-[#f5f5f7] flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-2 bg-white rounded-lg shadow-sm border max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => startConversation(searchUser)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/${searchUser.gender === "female" ? "avataaars" : "male"}/svg?seed=${searchUser.email}`}
                            alt={searchUser.username}
                          />
                          <AvatarFallback>
                            {searchUser.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {searchUser.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {searchUser.full_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-xs">Search for users to start chatting</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                        activeConversation?.id === conversation.id
                          ? "bg-blue-100 border border-blue-200"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => loadConversation(conversation.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/${otherUser?.gender === "female" ? "avataaars" : "male"}/svg?seed=${otherUser?.email}`}
                            alt={otherUser?.username || ""}
                          />
                          <AvatarFallback>
                            {otherUser?.username?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {otherUser?.username}
                          </div>
                          {conversation.last_message && (
                            <div className="text-xs text-gray-500 truncate">
                              {conversation.last_message.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/${getOtherParticipant(activeConversation)?.gender === "female" ? "avataaars" : "male"}/svg?seed=${getOtherParticipant(activeConversation)?.email}`}
                      alt={
                        getOtherParticipant(activeConversation)?.username || ""
                      }
                    />
                    <AvatarFallback>
                      {getOtherParticipant(
                        activeConversation,
                      )?.username?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {getOtherParticipant(activeConversation)?.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getOtherParticipant(activeConversation)?.full_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} className="px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Welcome to ChatConnect
                </h3>
                <p className="text-gray-500">
                  Search for users and start a conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
