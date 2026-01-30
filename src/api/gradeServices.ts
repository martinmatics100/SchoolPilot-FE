import { createApiClient } from "../utils/apiClient";

const BASE_URL = "/v1/grades";

/* ------------------ GET GRADING SYSTEM BY CLASS ------------------ */
export const fetchGradingSystemByClass = async (
  selectedAccount: string | null,
  classId: string
) => {
  if (!selectedAccount) {
    throw new Error("No account selected");
  }

  if (!classId) {
    throw new Error("ClassId is required");
  }

  const api = createApiClient({ selectedAccount });
  const response = await api.get(
    `${BASE_URL}/grades-systems?classId=${classId}`
  );

  /**
   * Expected BE response:
   * {
   *   grades: [...]
   * }
   */
  return response?.grades || [];
};

/* ------------------ SAVE / UPDATE GRADING SYSTEM ------------------ */
export const saveGradingSystem = async (
  selectedAccount: string | null,
  payload: {
    classId: string;
    grades: {
      id?: string;
      lowerBound: number;
      upperBound: number;
      gradeName: string;
      gradeRemark?: string;
      gradePoint: number;
      descriptor?: string;
    }[];
  }
) => {
  if (!selectedAccount) {
    throw new Error("No account selected");
  }

  const api = createApiClient({ selectedAccount });
  const response = await api.post(`${BASE_URL}/save-grading-system`, payload);
  return response;
};
