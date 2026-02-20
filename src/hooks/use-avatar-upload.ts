import { decode } from 'base64-arraybuffer';
import { useAuth } from '@/components/auth-provider';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

const AVATAR_BUCKET = 'avatars';

export function useAvatarUpload() {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUploadAvatar = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão para acessar fotos é necessária.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const base64 = asset.base64;
    if (!base64) {
      setError('Não foi possível ler a imagem.');
      return;
    }
    const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `${user.id}/avatar.${safeExt}`;
    const contentType = `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`;
    setUploading(true);
    try {
      const arrayBuffer = decode(base64);
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, arrayBuffer, { contentType, upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: publicUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  }, [user?.id, updateProfile]);

  return { pickAndUploadAvatar, uploading, error };
}
