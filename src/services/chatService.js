import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  setDoc, 
  doc, 
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// Get all users except the current user
export const getUsers = async (currentUserId) => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId) {
        users.push({
          id: doc.id,
          ...userData
        });
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Get or create a chat between two users
export const getOrCreateChat = async (user1Id, user2Id) => {
  try {
    // Create a unique chat ID (alphabetically ordered user IDs)
    const chatUsers = [user1Id, user2Id].sort();
    const chatId = `chat_${chatUsers[0]}_${chatUsers[1]}`;
    
    // Check if the chat already exists
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (!chatDoc.exists()) {
      // Create new chat
      await setDoc(doc(db, 'chats', chatId), {
        users: chatUsers,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null
      });
    }
    
    return chatId;
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    throw error;
  }
};

// Send a message to a chat
export const sendMessage = async (chatId, senderId, content) => {
  try {
    // Add message to the messages subcollection
    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId,
      content,
      timestamp: serverTimestamp()
    });
    
    // Update the chat document with last message info
    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      lastSenderId: senderId
    }, { merge: true });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a chat
export const getMessages = async (chatId) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const messages = [];
    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Subscribe to messages for a chat
export const subscribeToMessages = (chatId, callback) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // Set up real-time listener
    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
        });
      });
      
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userId) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('users', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    const chats = [];
    querySnapshot.forEach(doc => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
}; 