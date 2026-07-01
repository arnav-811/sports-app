import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, PostForm } from '../../lib/validators';
import { useCreatePost } from '../../hooks/usePosts';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useToast } from '../../hooks/useToast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

const POST_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'poll', label: 'Poll' },
  { id: 'image', label: 'Image' },
] as const;

interface PostComposeProps {
  communityName?: string;
  onSuccess?: () => void;
}

export function PostCompose({ communityName, onSuccess }: PostComposeProps) {
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { success, error } = useToast();
  const [type, setType] = useState<'text' | 'poll' | 'image'>('text');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const { mutate: createPost, isPending } = useCreatePost();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: { type: 'text', communityName: communityName || '' },
  });

  if (!user) {
    return (
      <div className="card p-4 text-center">
        <p className="text-sm text-text-2">
          <button onClick={() => openAuthModal('login')} className="underline hover:text-text-1">Log in</button> to create a post
        </p>
      </div>
    );
  }

  const onSubmit = (data: PostForm) => {
    createPost({
      ...data,
      type,
      ...(type === 'poll' && { pollOptions: pollOptions.filter(Boolean) }),
    }, {
      onSuccess: () => {
        success('Post created!');
        reset();
        onSuccess?.();
      },
      onError: () => error('Failed to create post'),
    });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={user.avatarUrl} username={user.username} size="sm" />
        <div className="flex gap-1">
          {POST_TYPES.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', type === t.id ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-2')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {!communityName && (
          <Input {...register('communityName')} placeholder="Choose a community..." error={errors.communityName?.message} />
        )}
        <Input {...register('title')} placeholder="Title" error={errors.title?.message} />
        {type === 'text' && (
          <textarea {...register('body')} placeholder="Text (optional)" className="input-base min-h-[80px] resize-y text-sm" />
        )}
        {type === 'poll' && (
          <div className="space-y-2">
            {pollOptions.map((opt, i) => (
              <Input key={i} value={opt} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }} placeholder={`Option ${i + 1}`} />
            ))}
            {pollOptions.length < 6 && (
              <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-text-3 hover:text-text-2">+ Add option</button>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isPending} size="sm">Post</Button>
        </div>
      </form>
    </div>
  );
}
