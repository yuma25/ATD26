import { DrizzleBadgeRepository } from "../repositories/DrizzleBadgeRepository";
import { DrizzleProfileRepository } from "../repositories/DrizzleProfileRepository";
import { DrizzleUserBadgeRepository } from "../repositories/DrizzleUserBadgeRepository";
import { GetAllBadgesUseCase } from "../../application/use-cases/GetAllBadgesUseCase";
import { AcquireBadgeUseCase } from "../../application/use-cases/AcquireBadgeUseCase";
import { GetAcquiredBadgesUseCase } from "../../application/use-cases/GetAcquiredBadgesUseCase";
import { GetProfileUseCase } from "../../application/use-cases/GetProfileUseCase";
import { UpdateProfileUseCase } from "../../application/use-cases/UpdateProfileUseCase";
import { DrizzleAdminRepository } from "../repositories/DrizzleAdminRepository";
import { RedisCacheService } from "../services/RedisCacheService";
import { GetStatsUseCase } from "../../application/use-cases/GetStatsUseCase";
import { AdminController } from "../../adapters/controllers/AdminController";
import { BadgeController } from "../../adapters/controllers/BadgeController";
import { ProfileController } from "../../adapters/controllers/ProfileController";

/**
 * 【依存性注入コンテナ】
 * 各レイヤーの具象クラスをインスタンス化し、ユースケースやコントローラーを組み立てる。
 * シングルトンとしてエクスポートされ、APIルート等から参照される。
 */

// --- インフラ層 / サービス ---
const cacheService = new RedisCacheService();

// --- インフラ層 / リポジトリ ---
const badgeRepository = new DrizzleBadgeRepository();
const profileRepository = new DrizzleProfileRepository();
const userBadgeRepository = new DrizzleUserBadgeRepository();
const adminRepository = new DrizzleAdminRepository();

// --- アプリケーション層 / ユースケース ---
const getAllBadgesUseCase = new GetAllBadgesUseCase(badgeRepository);
const acquireBadgeUseCase = new AcquireBadgeUseCase(userBadgeRepository, profileRepository);
const getAcquiredBadgesUseCase = new GetAcquiredBadgesUseCase(userBadgeRepository);
const getProfileUseCase = new GetProfileUseCase(profileRepository);
const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);
const getStatsUseCase = new GetStatsUseCase(adminRepository, cacheService);

// --- アダプター層 / コントローラー ---
/** 標本（バッジ）操作の窓口 */
export const badgeController = new BadgeController(
  getAllBadgesUseCase,
  acquireBadgeUseCase,
  getAcquiredBadgesUseCase
);

/** プロフィール操作の窓口 */
export const profileController = new ProfileController(
  getProfileUseCase,
  updateProfileUseCase
);

/** 管理者操作の窓口 */
export const adminController = new AdminController(getStatsUseCase);
