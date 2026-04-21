'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '../backend/types';
import { BadgeService } from '../backend/services/badgeService';
import { signInAnonymously } from '../backend/lib/supabase';

export const useHome = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [acquiredBadgeIds, setAcquiredBadgeIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(true);
  const [fullUserId, setFullUserId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  /**
   * 初期データのロード
   */
  const loadData = useCallback(async () => {
    setSyncing(true);
    try {
      const user = await signInAnonymously();
      if (user) {
        setFullUserId(user.id);
        const [allBadges, myAcquiredIds] = await Promise.all([
          BadgeService.getAllBadges(),
          BadgeService.getAcquiredBadgeIds(user.id)
        ]);
        setBadges(allBadges);
        setAcquiredBadgeIds(myAcquiredIds);
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setSyncing(false);
    }
  }, []);

  /**
   * カメラの先行許可リクエスト
   */
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission("granted");
      return true;
    } catch (err) {
      console.warn("Camera permission denied or failed:", err);
      setCameraPermission("denied");
      return false;
    }
  }, []);

  // データロード用
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // パーミッションチェック用
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then((result) => {
          setCameraPermission(result.state as "prompt" | "granted" | "denied");
          result.onchange = () => {
            setCameraPermission(result.state as "prompt" | "granted" | "denied");
          };
        })
        .catch(() => {});
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!fullUserId) return;
    navigator.clipboard.writeText(fullUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullUserId]);

  const isAcquired = (id: string) => acquiredBadgeIds.includes(id);

  return {
    badges,
    acquiredBadgeIds,
    syncing,
    fullUserId,
    copied,
    cameraPermission,
    isAcquired,
    copyToClipboard,
    requestCameraPermission,
    refresh: loadData
  };
};
