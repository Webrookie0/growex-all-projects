import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  getUsers, 
  getOrCreateChat, 
  sendMessage, 
  subscribeToMessages, 
  getUserChats 
} from '../services/chatService';

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userChats, setUserChats] = useState([]);
  
  const chatContainerRef = useRef(null);
  const messagesListener = useRef(null);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  
  // Fetch contacts and user's chats when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch all users (potential contacts)
        const usersData = await getUsers(user.id);
        setContacts(usersData);
        
        // Fetch user's existing chats
        const chats = await getUserChats(user.id);
        setUserChats(chats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      if (messagesListener.current) {
        messagesListener.current();
      }
    };
  }, [user, isAuthenticated, navigate]);
  
  // Handle search term changes
  useEffect(() => {
    if (!searchTerm.trim() || !contacts.length) {
      setSearchResults([]);
      return;
    }
    
    const filteredContacts = contacts.filter(contact => 
      contact.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(filteredContacts);
  }, [searchTerm, contacts]);
  
  // Scroll to bottom of chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Subscribe to messages when chat changes
  useEffect(() => {
    // Clean up previous listener
    if (messagesListener.current) {
      messagesListener.current();
      messagesListener.current = null;
    }
    
    if (!chatId) return;
    
    // Set up new listener
    messagesListener.current = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });
    
    return () => {
      if (messagesListener.current) {
        messagesListener.current();
      }
    };
  }, [chatId]);
  
  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    setSearchTerm('');
    setSearchResults([]);
    
    try {
      // Get or create chat between current user and selected contact
      const newChatId = await getOrCreateChat(user.id, contact.id);
      setChatId(newChatId);
    } catch (error) {
      console.error('Error selecting contact:', error);
    }
  };
  
  const handleSearchUser = (e) => {
    e.preventDefault();
    // Search is handled in the useEffect
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedContact || !user || !chatId) return;
    
    try {
      // Send message to Firestore
      await sendMessage(chatId, user.id, message);
      
      // Clear message input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">InfluencerConnect</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-10rem)] overflow-hidden bg-white shadow rounded-lg">
          {/* Contacts/Search Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleSearchUser} className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              
              {/* Search Results */}
              {searchTerm && searchResults.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Search Results
                  </h3>
                  <ul className="mt-2 divide-y divide-gray-100">
                    {searchResults.map(result => (
                      <li 
                        key={result.id}
                        className="py-2 px-2 hover:bg-gray-50 cursor-pointer rounded-md"
                        onClick={() => handleContactSelect(result)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden">
                            {result.avatar ? (
                              <img src={result.avatar} alt={result.username} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-white font-medium">{result.username.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.username}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {result.email}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {searchTerm && searchResults.length === 0 && (
                <div className="mt-2 text-center py-4 text-gray-500">
                  No users found. Try a different search term.
                </div>
              )}
            </div>
            
            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contacts
              </h3>
              <ul className="mt-2 divide-y divide-gray-100">
                {contacts.map(contact => (
                  <li 
                    key={contact.id}
                    className={`py-3 px-4 hover:bg-gray-50 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleContactSelect(contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden">
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.username} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-white font-medium">{contact.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                
                {contacts.length === 0 && (
                  <li className="py-4 text-center text-gray-500">
                    No contacts yet. Search for users to start a chat.
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden">
                    {selectedContact.avatar ? (
                      <img src={selectedContact.avatar} alt={selectedContact.username} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">{selectedContact.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{selectedContact.username}</p>
                    <p className="text-sm text-gray-500">{selectedContact.email}</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-4 overflow-y-auto"
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        No messages yet. Start a conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                              msg.senderId === user.id 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.senderId === user.id 
                                ? 'text-indigo-200' 
                                : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                      disabled={!message.trim()}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a contact to start a conversation or search for a user.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 