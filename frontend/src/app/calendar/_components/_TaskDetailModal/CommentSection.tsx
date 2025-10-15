import { Box, Typography, List, ListItem, Paper, Avatar, Divider } from '@mui/material';
import dayjs from 'dayjs';
import { Comment } from '@/types';

interface CommentSectionProps {
    comments: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Comments ({comments.length})
            </Typography>
            <List sx={{ p: 0 }}>
                {comments.map((comment, index) => (
                    <ListItem key={comment.commentId} sx={{ p: 0, mb: 2, display: 'block' }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {comment.author.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {comment.author}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {comment.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {dayjs(comment.timestamp).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                        </Paper>
                        {index !== comments.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}