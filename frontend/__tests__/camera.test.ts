import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * パッケージ: __tests__
 * カメラ権限リクエストおよびアクティベーションロジックの検証を行う。
 */

/**
 * [概要] テスト環境用のグローバルなモック設定である。
 * navigator.mediaDevices.getUserMedia をモック化し、テスト中に実際のカメラデバイスへのアクセスが発生しないようにする。
 */
const mockMediaDevices = {
  getUserMedia: vi.fn(),
};

Object.defineProperty(global.navigator, "mediaDevices", {
  value: mockMediaDevices,
  writable: true,
});

/**
 * [概要] カメラ権限のリクエスト処理をシミュレートする補助関数である。
 * 内部でモック化された getUserMedia を呼び出し、結果に応じたステータスを返却する。
 *
 * @return result [Object] 成功フラグ (success) および権限ステータス (status) を含む。
 */
async function simulateRequestPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // 成功時：取得したストリームの全トラックを停止させる（リソース解放のシミュレート）。
    stream.getTracks().forEach((track: { stop: () => void }) => track.stop());
    return { success: true, status: "granted" };
  } catch {
    // 拒否またはエラー時。
    return { success: false, status: "denied" };
  }
}

/**
 * [概要] カメラ起動ロジックのテストスイートである。
 */
describe("Camera Activation Logic", () => {
  beforeEach(() => {
    // 各テスト実行前にモックの呼び出し履歴をクリアする。
    vi.clearAllMocks();
  });

  it("カメラの許可が得られた場合、成功を返すこと", async () => {
    // [概要] getUserMedia が成功（ストリームを返す）するケースの検証。
    mockMediaDevices.getUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });

    const result = await simulateRequestPermission();

    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(result.success).toBe(true);
    expect(result.status).toBe("granted");
  });

  it("ユーザーがカメラを拒否した場合、失敗を返すこと", async () => {
    // [概要] getUserMedia がエラー（Permission denied）を投げるケースの検証。
    mockMediaDevices.getUserMedia.mockRejectedValue(
      new Error("Permission denied"),
    );

    const result = await simulateRequestPermission();

    expect(result.success).toBe(false);
    expect(result.status).toBe("denied");
  });
});
