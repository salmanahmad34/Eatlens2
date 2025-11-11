import React, { useState, useEffect, useCallback } from 'react';
import { getPendingRequests, approveRequest, getProUsers, downgradeUser, getCompletedRequests, rejectRequest, getAllReviews, updateReviewStatus, getContactMessages, updateMessageStatus } from '../services/adminService';
import type { UpgradeRequest, User, Review, ContactMessage } from '../types';
import { Card } from './ui/Card';
import { Spinner } from './Spinner';

type AdminTab = 'pending' | 'pro' | 'history' | 'reviews' | 'messages';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pending');
    const [pendingRequests, setPendingRequests] = useState<UpgradeRequest[]>([]);
    const [completedRequests, setCompletedRequests] = useState<UpgradeRequest[]>([]);
    const [proUsers, setProUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [pending, completed, pro, reviewsData, messagesData] = await Promise.all([
                getPendingRequests(),
                getCompletedRequests(),
                getProUsers(),
                getAllReviews(),
                getContactMessages(),
            ]);
            setPendingRequests(pending);
            setCompletedRequests(completed);
            setProUsers(pro);
            setReviews(reviewsData);
            setMessages(messagesData);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError("Could not load data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (request: UpgradeRequest) => {
        setActionInProgressId(request.id);
        try {
            await approveRequest(request.id, request.userId);
            await fetchData(); // Refresh all data
        } catch (err) {
            console.error("Failed to approve request:", err);
            alert(`Failed to approve request for ${request.userEmail}. Please check the console.`);
        } finally {
            setActionInProgressId(null);
        }
    };

    const handleReject = async (request: UpgradeRequest) => {
        if (window.confirm(`Are you sure you want to reject this request for ${request.userEmail}? Their plan will be set back to Free.`)) {
            setActionInProgressId(request.id);
            try {
                await rejectRequest(request.id, request.userId);
                await fetchData(); // Refresh all data
            } catch (err) {
                console.error("Failed to reject request:", err);
                alert(`Failed to reject request for ${request.userEmail}. Please check the console.`);
            } finally {
                setActionInProgressId(null);
            }
        }
    };

    const handleDowngrade = async (user: User) => {
        if (window.confirm(`Are you sure you want to downgrade ${user.email} to the Free plan?`)) {
            setActionInProgressId(user.uid);
            try {
                await downgradeUser(user.uid);
                await fetchData(); // Refresh all data
            } catch (err) {
                console.error("Failed to downgrade user:", err);
                alert(`Failed to downgrade ${user.email}. Please check the console.`);
            } finally {
                setActionInProgressId(null);
            }
        }
    };
    
    const handleUpdateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
        setActionInProgressId(reviewId);
        try {
            await updateReviewStatus(reviewId, status);
            await fetchData();
        } catch(err) {
            console.error(`Failed to ${status} review:`, err);
            alert(`Could not update review status. Please check the console.`);
        } finally {
            setActionInProgressId(null);
        }
    };

    const handleUpdateMessageStatus = async (messageId: string, status: 'new' | 'read') => {
        setActionInProgressId(messageId);
        try {
            await updateMessageStatus(messageId, status);
            await fetchData();
        } catch(err) {
            console.error(`Failed to update message status:`, err);
            alert(`Could not update message status. Please check the console.`);
        } finally {
            setActionInProgressId(null);
        }
    };

    const TabButton: React.FC<{tabId: AdminTab, label: string, count: number}> = ({ tabId, label, count }) => (
        <button 
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors relative ${activeTab === tabId ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
            { count > 0 && <span className={`absolute -top-2 -right-2 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${activeTab === tabId ? 'bg-white text-green-700 ring-2 ring-green-600' : 'bg-green-600 text-white'}`}>{count}</span>}
        </button>
    );

    const renderPendingTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name on Payment</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR / Transaction ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRequests.map((req) => (
                        <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.userEmail}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.nameOnPayment}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{req.utrNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {req.submittedAt ? new Date(req.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => handleApprove(req)}
                                    disabled={actionInProgressId === req.id}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:bg-gray-400"
                                >
                                    {actionInProgressId === req.id ? '...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleReject(req)}
                                    disabled={actionInProgressId === req.id}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:bg-gray-400"
                                >
                                    {actionInProgressId === req.id ? '...' : 'Reject'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProUsersTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Downgrade</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {proUsers.map((user) => (
                        <tr key={user.uid}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDowngrade(user)}
                                    disabled={actionInProgressId === user.uid}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:bg-gray-400"
                                >
                                    {actionInProgressId === user.uid ? 'Downgrading...' : 'Downgrade to Free'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const renderHistoryTable = () => (
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {completedRequests.map((req) => {
                        const completionTimestamp = req.approvedAt || req.rejectedAt;
                        return (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.userEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{req.utrNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                        req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {completionTimestamp ? new Date(completionTimestamp.seconds * 1000).toLocaleString() : 'N/A'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderReviewsTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.userName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600"><div className="max-w-md whitespace-pre-wrap">{review.reviewText}</div></td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                    review.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    review.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                    {review.status}
                                </span>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {review.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateReview(review.id, 'approved')}
                                            disabled={actionInProgressId === review.id}
                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUpdateReview(review.id, 'rejected')}
                                            disabled={actionInProgressId === review.id}
                                            className="text-rose-600 hover:text-rose-900 disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const renderMessagesTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((msg) => (
                        <tr key={msg.id} className={msg.status === 'new' ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{msg.name}</div>
                                <div className="text-sm text-gray-500">{msg.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600"><div className="max-w-lg whitespace-pre-wrap">{msg.message}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(msg.submittedAt.seconds * 1000).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                    msg.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {msg.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {msg.status === 'new' && (
                                    <button
                                        onClick={() => handleUpdateMessageStatus(msg.id, 'read')}
                                        disabled={actionInProgressId === msg.id}
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
        if (error) return <p className="text-center text-rose-600 p-8">{error}</p>;
        
        switch (activeTab) {
            case 'pending':
                return pendingRequests.length > 0 ? renderPendingTable() : <p className="text-center text-gray-500 p-8">No pending upgrade requests found.</p>;
            case 'pro':
                return proUsers.length > 0 ? renderProUsersTable() : <p className="text-center text-gray-500 p-8">No users are currently on the Pro plan.</p>;
            case 'history':
                return completedRequests.length > 0 ? renderHistoryTable() : <p className="text-center text-gray-500 p-8">No completion history found.</p>;
            case 'reviews':
                return reviews.length > 0 ? renderReviewsTable() : <p className="text-center text-gray-500 p-8">No reviews have been submitted yet.</p>;
             case 'messages':
                return messages.length > 0 ? renderMessagesTable() : <p className="text-center text-gray-500 p-8">No contact messages have been received yet.</p>;
            default:
                return null;
        }
    };

    return (
        <Card className="w-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
                <div className="flex items-center flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
                    <TabButton tabId="pending" label="Pending" count={pendingRequests.length} />
                    <TabButton tabId="pro" label="Pro Users" count={proUsers.length} />
                    <TabButton tabId="history" label="History" count={completedRequests.length} />
                    <TabButton tabId="reviews" label="Reviews" count={reviews.filter(r => r.status === 'pending').length} />
                    <TabButton tabId="messages" label="Messages" count={messages.filter(m => m.status === 'new').length} />
                </div>
            </div>
            {renderContent()}
        </Card>
    );
};