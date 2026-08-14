// HTTP client
export { apiClient, BASE_URL } from "./api";

// Services — one export per resource
export { authService }         from "./auth.service";
export { usersService }        from "./users.service";
export { plansService }        from "./plans.service";
export { paymentsService }     from "./payments.service";
export { subscriptionsService } from "./subscriptions.service";
export { resumeService }       from "./resume.service";
export { arkService }          from "./ark.service";
export { ccgeService }         from "./ccge.service";
export { verificationService } from "./verification.service";
export { aiService }           from "./ai.service";
export { featureFlagsService } from "./feature-flags.service";
export { matchmakingService }  from "./matchmaking.service";
export { sphinxService }       from "./sphinx.service";
export { f1000Service }        from "./f1000.service";
export { bookService }         from "./book.service";
