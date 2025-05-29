import axios from "@/lib/axios-config";
import { apiService } from "../common/apiService"

export interface UserData {
  username: string
  email: string
  preferredTheater?: string
  [key: string]: any // 추가 필드를 위한 인덱스 시그니처
}

/**
 * 사용자 정보를 가져오는 함수
 * @returns 사용자 데이터
 */
export const getUserProfile = (): UserData | null => {
  try {
    // 로컬 스토리지와 세션 스토리지 모두 확인
    const localUser = localStorage.getItem("user")
    const sessionUser = sessionStorage.getItem("user")

    const storedUser = localUser || sessionUser

    if (!storedUser) {
      console.warn("스토리지에 사용자 정보가 없습니다.")
      return null
    }

    const userData = JSON.parse(storedUser)

    // 필수 필드 확인
    if (!userData.username || !userData.email) {
      console.warn("사용자 정보가 불완전합니다:", userData)

      // 이메일이 있고 사용자 이름이 없는 경우, 이메일에서 사용자 이름 추출
      if (userData.email && !userData.username) {
        userData.username = userData.email.split("@")[0]
      }

      // userDetailDTO 형식으로 저장된 경우 처리
      if (userData.userDetailDTO) {
        userData.username = userData.userDetailDTO.username
        userData.email = userData.userDetailDTO.email
        userData.user_id = userData.userDetailDTO.user_id
      }

      // 그래도 필수 필드가 없으면 null 반환
      if (!userData.username || !userData.email) {
        return null
      }
    }

    // 다른 스토리지에도 복제
    if (localUser && !sessionUser) {
      sessionStorage.setItem("user", localUser)
    } else if (!localUser && sessionUser) {
      localStorage.setItem("user", sessionStorage.getItem("user") || "")
    }

    return userData
  } catch (error) {
    console.error("사용자 정보 파싱 오류:", error)
    return null
  }
}

/**
 * 로그아웃 처리 함수
 */
export const logout = (): void => {
  // 모든 스토리지에서 제거
  localStorage.removeItem("user")
  sessionStorage.removeItem("user")
}

// 사용자 프로필 업데이트 함수
export const updateUserProfile = async (
  field: string,
  value: string,
  currentPassword: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const userData = getUserProfile();

    if (!userData || !userData.email) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    if (!currentPassword) {
      throw new Error("현재 비밀번호가 필요합니다.");
    }

    if (currentPassword === value) {
      throw new Error("현재 비밀번호와 새 비밀번호가 동일합니다.");
    }

    // 비밀번호 변경 시 새 비밀번호 확인
    if (field === "password" && !value) {
      throw new Error("새 비밀번호가 필요합니다.");
    }

    // 필드에 따라 다른 API 엔드포인트 사용
    let apiEndpoint = "";
    if (field === "username") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/username";
    } else if (field === "password") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/password";
    } else if (field === "email") {
      apiEndpoint = "https://hs-cinemagix.duckdns.org/api/v1/detail/change/email";
    } else {
      throw new Error("지원하지 않는 필드입니다.");
    }

    // API 요청 데이터 구성
    const requestData = {
      user_id: userData.user_id,
      password: currentPassword,
      after: value,
    };

    console.log("API 요청 데이터:", {
      endpoint: apiEndpoint,
      user_id: requestData.user_id,
      hasPassword: !!requestData.password,
      afterLength: requestData.after ? requestData.after.length : 0,
    });

    const response = await axios.post(apiEndpoint, requestData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    console.log("API 응답:", response.data);

    if (response.data.code === "SUCCESS") {
      return {
        success: true,
        message:
          field === "password"
            ? "비밀번호가 변경되었습니다."
            : `${field === "username" ? "이름" : "이메일"}이 변경되었습니다.`,
      };
    }

    return {
      success: false,
      message: response.data.message || "업데이트에 실패했습니다.",
    };
  } catch (error: any) {
    console.error("사용자 정보 업데이트 오류:", error);
    console.error("상세 오류:", error.response?.data || "상세 정보 없음");

    return {
      success: false,
      message: error.response?.data?.message || error.message || "업데이트 중 오류가 발생했습니다.",
    };
  }
};

// 회원 탈퇴 함수
export const deleteUserAccount = async (password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userData = getUserProfile();

    if (!userData || !userData.email) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    if (!password) {
      throw new Error("비밀번호가 필요합니다.");
    }

    console.log("회원 탈퇴 요청 준비:", {
      email: userData.email,
      hasPassword: !!password,
    });

    // API 요청 데이터 구성
    const requestData = {
      email: userData.email,
      password: password,
    };

    // Spring 서버로 직접 요청
    const response = await axios.post(
      "https://hs-cinemagix.duckdns.org/api/v1/user/deleteAccount",
      requestData,
      {
        withCredentials: true, // 쿠키(JWT) 포함
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    console.log("API 응답:", response.data);

    if (response.data.code === "SUCCESS") {
      // 탈퇴 성공 시 로그아웃 처리
      logout();

      return {
        success: true,
        message: "회원 탈퇴가 완료되었습니다.",
      };
    }

    return {
      success: false,
      message: response.data.message || "회원 탈퇴에 실패했습니다.",
    };
  } catch (error: any) {
    console.error("회원 탈퇴 오류:", error);
    console.error("상세 오류:", error.response?.data || "상세 정보 없음");

    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "회원 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.",
    };
  }
};

// 이메일 인증 코드 전송 함수
export const sendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
  // 이메일 형식 검증
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: "이메일 형식이 올바르지 않습니다.",
    }
  }

  try {
    const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/verifyEmail", { email })

    console.log("인증 코드 전송 응답:", response.data)

    // 백엔드 응답이 문자열 "SUCCESS"인 경우 처리
    if (response.data === "SUCCESS") {
      return {
        success: true,
        message: "인증 코드가 이메일로 전송되었습니다.",
      }
    }

    // 명시적인 실패 응답이 있는 경우
    if (response.data.message) {
      return {
        success: false,
        message: response.data.message,
      }
    }

    // 기본 실패 메시지
    return {
      success: false,
      message: "인증 코드 전송에 실패했습니다. 다시 시도해주세요.",
    }
  } catch (error: any) {
    console.error("인증 코드 전송 오류:", error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || "인증 코드 전송 중 오류가 발생했습니다.",
    }
  }
}

// 이메일 인증 코드 확인 함수
export const verifyEmailCode = async (email: string, authnum: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 백엔드 API 요청 시 code 파라미터 이름을 authnum으로 변경
    const response = await axios.post("https://hs-cinemagix.duckdns.org/api/v1/user/check", { email, authnum })

    console.log("인증 코드 확인 응답:", response.data)

    // 백엔드 응답이 문자열 "SUCCESS"인 경우 처리
    if (response.data === "SUCCESS") {
      return {
        success: true,
        message: "이메일 인증이 완료되었습니다.",
      }
    }

    // 명시적인 실패 응답이 있는 경우
    if (response.data.message) {
      return {
        success: false,
        message: response.data.message,
      }
    }

    // 기본 실패 메시지
    return {
      success: false,
      message: "인증 코드가 올바르지 않습니다. 다시 확인해주세요.",
    }
  } catch (error: any) {
    console.error("인증 코드 확인 오류:", error)
    console.error("상세 오류:", error.response?.data || "상세 정보 없음")

    return {
      success: false,
      message: error.response?.data?.message || error.message || "인증 코드 확인 중 오류가 발생했습니다.",
    }
  }
}

// 사용자 예매 내역(주문+티켓) 조회 함수 - orderId 포함된 orders API 사용
export const getUserTickets = async (userId: number): Promise<any> => {
  try {
    // 주문(orders) API로 변경
    const response = await axios.get(
      `https://hs-cinemagix.duckdns.org/api/v1/orders/user/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      },
    )

    console.log("주문+티켓 내역 조회 응답:", response.data)

    // 주문 배열 반환
    if (Array.isArray(response.data)) {
      return response.data
    }

    return []
  } catch (error: any) {
    console.error("주문+티켓 내역 조회 오류:", error)
    throw new Error(error.response?.data?.message || "예매 내역을 불러오는 중 오류가 발생했습니다.")
  }
}