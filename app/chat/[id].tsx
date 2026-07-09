import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    Alert,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useAuth } from '../../context/AuthContext';
import { API_URL, BASE_URL } from '../../constants/api';
import { appendFormFile } from '../../utils/fileUpload';

const SOCKET_URL = API_URL.replace('/api', '');

export default function ChatRoomScreen() {
    const { id, petName, ownerName } = useLocalSearchParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [mediaPreview, setMediaPreview] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
    const [sendingMedia, setSendingMedia] = useState(false);
    const socket = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/chat/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const mappedMessages = data.messages.map((m: any) => ({
                    _id: m._id,
                    matchId: m.match,
                    senderId: m.sender,
                    content: m.content,
                    mediaUrl: m.mediaUrl || null,
                    mediaType: m.mediaType || null,
                    timestamp: m.createdAt,
                }));
                setMessages(mappedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchMessages();

        socket.current = io(SOCKET_URL, { query: { token } });

        socket.current.on('connect', () => {
            socket.current?.emit('join_room', id);
        });

        socket.current.on('receive_message', (message) => {
            setMessages((prev) => {
                const isDuplicate = prev.some(m => m._id === message._id);
                if (isDuplicate) return prev;

                const filtered = prev.filter(m =>
                    !(m.content === message.content && m.senderId === message.senderId && m._id?.startsWith('temp_'))
                );

                return [...filtered, {
                    ...message,
                    timestamp: message.createdAt || new Date().toISOString()
                }];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });

        return () => { socket.current?.disconnect(); };
    }, [id, token, fetchMessages]);

    const sendMessage = () => {
        if (newMessage.trim() === '' || !socket.current) return;

        const optimisticId = `temp_${Date.now()}`;
        const messageData = {
            matchId: id,
            senderId: user?._id,
            content: newMessage,
            optimisticId,
        };

        socket.current.emit('send_message', messageData);

        setMessages(prev => [...prev, {
            ...messageData,
            _id: optimisticId,
            timestamp: new Date().toISOString(),
        }]);
        setNewMessage('');

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    // ── Media picking ──
    const pickMedia = async (type: 'image' | 'video') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required to send media.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'image'
                ? ImagePicker.MediaTypeOptions.Images
                : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setMediaPreview({ uri: result.assets[0].uri, type });
        }
    };

    const showMediaPicker = () => {
        Alert.alert('Send Media', 'Choose media type', [
            { text: 'Photo', onPress: () => pickMedia('image') },
            { text: 'Video', onPress: () => pickMedia('video') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const sendMediaMessage = async () => {
        if (!mediaPreview) return;
        setSendingMedia(true);

        try {
            const formData = new FormData();
            formData.append('matchId', id as string);

            await appendFormFile(formData, 'media', mediaPreview.uri);

            const response = await fetch(`${API_URL}/chat/send-media`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                const msg = data.message;
                // Also emit via socket so other user gets it in real-time
                socket.current?.emit('send_message', {
                    matchId: id,
                    senderId: user?._id,
                    content: '',
                    mediaUrl: msg.mediaUrl,
                    mediaType: msg.mediaType,
                });

                setMessages(prev => [...prev, {
                    _id: msg._id,
                    matchId: id,
                    senderId: user?._id,
                    content: '',
                    mediaUrl: msg.mediaUrl,
                    mediaType: msg.mediaType,
                    timestamp: msg.createdAt || new Date().toISOString(),
                }]);

                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            } else {
                Alert.alert('Error', data.message || 'Failed to send media');
            }
        } catch (error) {
            console.error('Error sending media:', error);
            Alert.alert('Error', 'Something went wrong while sending media.');
        } finally {
            setSendingMedia(false);
            setMediaPreview(null);
        }
    };

    // ── Render message bubble ──
    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?._id;

        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    {item.mediaType === 'image' && item.mediaUrl ? (
                        <Image
                            source={{ uri: `${BASE_URL}${item.mediaUrl}` }}
                            style={styles.mediaImage}
                            contentFit="cover"
                        />
                    ) : item.mediaType === 'video' && item.mediaUrl ? (
                        <TouchableOpacity
                            style={styles.videoThumb}
                            onPress={() => Linking.openURL(`${BASE_URL}${item.mediaUrl}`)}
                        >
                            <View style={styles.videoPlayOverlay}>
                                <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                            </View>
                            <Text style={styles.videoLabel}>Tap to play video</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                            {item.content}
                        </Text>
                    )}
                </View>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#7ED6D1" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#DDE6F0" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {petName ? `${petName} ` : ''}
                        {ownerName ? <Text style={{ fontSize: 14, color: '#888' }}>({ownerName})</Text> : ''}
                        {!petName && !ownerName ? 'Chat' : ''}
                    </Text>
                    <Text style={styles.headerStatus}>Online</Text>
                </View>
                <TouchableOpacity style={styles.optionsButton}>
                    <Ionicons name="call-outline" size={24} color="#DDE6F0" />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item._id?.toString() || index.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                keyboardShouldPersistTaps="handled"
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton} onPress={showMediaPicker}>
                    <Ionicons name="attach" size={26} color="#7ED6D1" />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="rgba(221, 230, 240, 0.4)"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons name="send" size={22} color={newMessage.trim() ? "#07141D" : "rgba(7, 20, 29, 0.4)"} />
                </TouchableOpacity>
            </View>

            {/* Media Preview Modal */}
            <Modal visible={!!mediaPreview} transparent animationType="slide">
                <View style={styles.previewOverlay}>
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewTitle}>
                            {mediaPreview?.type === 'video' ? '🎬 Video Preview' : '📷 Photo Preview'}
                        </Text>
                        {mediaPreview?.type === 'image' ? (
                            <Image
                                source={{ uri: mediaPreview.uri }}
                                style={styles.previewImage}
                                contentFit="contain"
                            />
                        ) : (
                            <View style={styles.videoPreviewBox}>
                                <Ionicons name="videocam" size={64} color="#7ED6D1" />
                                <Text style={styles.videoPreviewText}>Video ready to send</Text>
                            </View>
                        )}
                        <View style={styles.previewActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setMediaPreview(null)}
                                disabled={sendingMedia}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sendMediaBtn, sendingMedia && styles.sendMediaBtnDisabled]}
                                onPress={sendMediaMessage}
                                disabled={sendingMedia}
                            >
                                {sendingMedia ? (
                                    <ActivityIndicator size="small" color="#07141D" />
                                ) : (
                                    <Text style={styles.sendMediaBtnText}>Send</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07141D',
    },
    centered: {
        flex: 1,
        backgroundColor: '#07141D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#1C2C35',
        borderBottomWidth: 1,
        borderBottomColor: '#3A4A55',
    },
    backButton: { marginRight: 15 },
    headerInfo: { flex: 1 },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#DDE6F0',
    },
    headerStatus: {
        fontSize: 12,
        color: '#7ED6D1',
    },
    optionsButton: { padding: 5 },
    messagesList: {
        padding: 20,
        paddingBottom: 10,
    },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '80%',
    },
    myMessageWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    otherMessageWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 4,
        overflow: 'hidden',
    },
    myBubble: {
        backgroundColor: '#7ED6D1',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#1C2C35',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#3A4A55',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: { color: '#07141D' },
    otherMessageText: { color: '#DDE6F0' },
    mediaImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    videoThumb: {
        width: 200,
        height: 140,
        backgroundColor: '#07141D',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoLabel: {
        color: '#DDE6F0',
        fontSize: 12,
        marginTop: 6,
        opacity: 0.7,
    },
    timestamp: {
        fontSize: 10,
        color: '#DDE6F0',
        opacity: 0.4,
    },
    // ── Input bar ──
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        backgroundColor: '#1C2C35',
        borderTopWidth: 1,
        borderTopColor: '#3A4A55',
    },
    attachButton: {
        marginRight: 8,
        padding: 4,
    },
    input: {
        flex: 1,
        backgroundColor: '#07141D',
        color: '#DDE6F0',
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#7ED6D1',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(126, 214, 209, 0.3)',
    },
    // ── Media Preview Modal ──
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    previewContainer: {
        backgroundColor: '#1C2C35',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 48 : 28,
    },
    previewTitle: {
        color: '#DDE6F0',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    previewImage: {
        width: '100%',
        height: 280,
        borderRadius: 16,
        marginBottom: 20,
    },
    videoPreviewBox: {
        width: '100%',
        height: 160,
        backgroundColor: '#07141D',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3A4A55',
    },
    videoPreviewText: {
        color: '#DDE6F0',
        marginTop: 10,
        fontSize: 15,
        opacity: 0.7,
    },
    previewActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#3A4A55',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#DDE6F0',
        fontSize: 16,
        fontWeight: '600',
    },
    sendMediaBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        backgroundColor: '#7ED6D1',
        alignItems: 'center',
    },
    sendMediaBtnDisabled: {
        backgroundColor: 'rgba(126,214,209,0.5)',
    },
    sendMediaBtnText: {
        color: '#07141D',
        fontSize: 16,
        fontWeight: '700',
    },
});
