// Setup step constants
export const SETUP_STEPS = {
  CONNECT_GOOGLE: "connect-google",
  SET_PREFERENCES: "set-preferences",
} as const;

export type SetupStep = (typeof SETUP_STEPS)[keyof typeof SETUP_STEPS];

export interface UserSetupStatus {
  googleConnected: boolean;
  preferencesSet: boolean;
  completionPercentage: number;
  missingSteps: SetupStep[];
}
