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

        // 1. 5つのモック標本を作成（これらは獲得済みとする）
        const mockBadges: Badge[] = Array.from({ length: 5 }).map((_, i) => ({
          id: `painting-00${i + 1}`,
          name: `Specimen ${String.fromCharCode(65 + i)}`,
          description: `Historical Archive #${i + 1}`,
          color: ['#3e2f28', '#2563eb', '#10b981', '#f59e0b', '#ef4444'][i],
          model_url: '/butterfly.glb',
          target_index: i
        }));

        // 2. 実在するバッジ（例：butterfly-001）を取得。なければモックの6番目を作成
        const realBadge = allBadges.find(b => b.id === 'butterfly-001') || {
          id: 'butterfly-001',
          name: 'The Living Specimen',
          description: 'A real discovery waiting in AR',
          color: '#8b5cf6',
          model_url: '/butterfly.glb',
          target_index: 5
        };

        // 3. 5つのモック + 1つの実在バッジの計6つをセット
        setBadges([...mockBadges, realBadge]);

        // 4. 獲得済みリストの設定（モックの5つは必ず入れる）
        const mockAcquiredIds = mockBadges.map(b => b.id);
        setAcquiredBadgeIds([...mockAcquiredIds, ...myAcquiredIds]);
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

  const isAcquired = (id: string) => acquiredBadgeIds.includes(id);

  return {
    badges,
    acquiredBadgeIds,
    syncing,
    fullUserId,
    copied,
    cameraPermission,
    isAcquired,
    requestCameraPermission,
    refresh: loadData
  };
};
