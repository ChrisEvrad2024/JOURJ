// src/hooks/useBlog.js
import { useState, useEffect, useCallback } from 'react';
import { BlogService } from '../services';
import { toast } from 'sonner';

export const useBlog = () => {
    const [posts, setPosts] = useState([]);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await BlogService.getAllPosts();
            setPosts(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch blog posts');
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPostById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await BlogService.getPostById(id);
            setPost(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch blog post');
            console.error('Error fetching blog post:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const addComment = useCallback(async (postId, comment) => {
        try {
            await BlogService.addComment(postId, comment);
            // Refresh post to get updated comments
            await fetchPostById(postId);
            toast.success('Commentaire ajouté');
        } catch (err) {
            toast.error('Échec de l\'ajout du commentaire');
            console.error('Error adding comment:', err);
        }
    }, [fetchPostById]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        post,
        loading,
        error,
        fetchPosts,
        fetchPostById,
        addComment,
        getRecentPosts: BlogService.getRecentPosts,
        getPostsByCategory: BlogService.getPostsByCategory,
        getPostsByTag: BlogService.getPostsByTag,
        searchPosts: BlogService.searchPosts
    };
};