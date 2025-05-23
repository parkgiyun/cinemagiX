"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "../common/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  Home,
  Trash2,
  MapPin,
  Ticket,
  Calendar,
  X,
  ArrowLeft,
  LogOut,
  Loader2,
} from "lucide-react"
import type { UserData } from "./dashboardFeatures"
import {
  updateUserProfile,
  deleteUserAccount,
  sendVerificationCode,
  verifyEmailCode,
  getUserTickets,
} from "./dashboardFeatures"
import { cancelOrder } from "../common/apiService"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRegion, useTheather } from "@/app/redux/reduxService"

interface DashboardContentProps {
  user: UserData
  onLogout: () => void
  onUpdateUser: (field: string, value: string) => void
}

export const DashboardContent = ({ user, onLogout, onUpdateUser }: DashboardContentProps) => {
  const router = useRouter()
  // DashboardContent 컴포넌트 내부에 추가할 상태 변수들
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  // 영화관 및 예매 관련 상태 추가
  const [selectedTheater, setSelectedTheater] = useState(user.preferredTheater || "")
  const [bookingHistory, setBookingHistory] = useState<any[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketsError, setTicketsError] = useState("")

  // 프로필 정보 상태
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [profilePassword, setProfilePassword] = useState("")

  // 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // 상태 변수 추가 (DashboardContent 컴포넌트 내부)
  const [newEmail, setNewEmail] = useState(user.email)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationLoading, setLoadingVerification] = useState(false)

  // Redux에서 지역 및 극장 정보 가져오기
  const { regionList } = useRegion()
  const { theaterList } = useTheather()

  // 이메일 인증 코드 전송 함수 추가
  const handleSendVerification = async () => {
    if (!newEmail) {
      setError("이메일을 입력해주세요.")
      return
    }

    if (newEmail === user.email) {
      setError("현재 이메일과 동일합니다.")
      return
    }

    setLoadingVerification(true)
    setSuccess("")
    setError("")

    try {
      const result = await sendVerificationCode(newEmail)
      if (result.success) {
        setVerificationSent(true)
        setSuccess(result.message)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "인증 코드 전송 중 오류가 발생했습니다.")
    } finally {
      setLoadingVerification(false)
    }
  }

  // 이메일 인증 코드 확인 함수 추가
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.")
      return
    }

    setLoadingVerification(true)
    setSuccess("")
    setError("")

    try {
      const result = await verifyEmailCode(newEmail, verificationCode)
      console.log("인증 코드 확인 결과:", result)

      if (result.success) {
        setVerificationSuccess(true)
        setSuccess(result.message)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error("인증 코드 확인 중 오류:", err)
      setError(err.message || "인증 코드 확인 중 오류가 발생했습니다.")
    } finally {
      setLoadingVerification(false)
    }
  }

  // 이메일 업데이트 함수 수정
  const handleUpdateProfile = async (field: string) => {
    setLoading(true)
    setSuccess("")
    setError("")

    try {
      let value = ""

      if (field === "username") {
        value = username
        if (!value.trim()) {
          throw new Error("이름을 입력해주세요.")
        }
      } else if (field === "email") {
        value = newEmail
        if (!value.trim() || !value.includes("@")) {
          throw new Error("유효한 이메일을 입력해주세요.")
        }

        // 이메일 변경 시 인증 확인
        if (!verificationSuccess) {
          throw new Error("이메일 인증을 완료해주세요.")
        }
      }

      if (!profilePassword) {
        throw new Error("현재 비밀번호를 입력해주세요.")
      }

      console.log("프로필 업데이트 시도:", {
        field,
        value,
        hasPassword: !!profilePassword,
      })

      const result = await updateUserProfile(field, value, profilePassword)

      if (result.success) {
        setSuccess(result.message)
        setProfilePassword("")

        // 이메일 변경 성공 시 인증 상태 초기화
        if (field === "email") {
          setVerificationSent(false)
          setVerificationSuccess(false)
          setVerificationCode("")
        }

        // 성공 시 부모 컴포넌트에 알려 상태 업데이트
        onUpdateUser(field, value)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "업데이트 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setLoading(true)
    setSuccess("")
    setError("")

    try {
      if (!currentPassword) {
        throw new Error("현재 비밀번호를 입력해주세요.")
      }

      if (!newPassword) {
        throw new Error("새 비밀번호를 입력해주세요.")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
      }

      if (newPassword.length < 6) {
        throw new Error("비밀번호는 최소 6자 이상이어야 합니다.")
      }

      console.log("비밀번호 변경 시도:", {
        hasCurrentPassword: !!currentPassword,
        hasNewPassword: !!newPassword,
        newPasswordLength: newPassword.length,
        actualNewPassword: newPassword, // 실제 값 로깅 (개발 환경에서만 사용)
      })

      // 비밀번호 변경 시 value 파라미터에 새 비밀번호를 전달
      const result = await updateUserProfile("password", newPassword, currentPassword)

      if (result.success) {
        setSuccess(result.message)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "비밀번호 변경 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("비밀번호를 입력해주세요.")
      return
    }

    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    setLoading(true)
    setSuccess("")
    setError("")

    try {
      const result = await deleteUserAccount(deletePassword)

      if (result.success) {
        alert("회원 탈퇴가 완료되었습니다. 홈 화면으로 이동합니다.")
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "회원 탈퇴 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadUserTickets = async () => {
      if (!user || !user.user_id) return

      try {
        setTicketsLoading(true)
        setTicketsError("")

        const tickets = await getUserTickets(user.user_id)

        // 티켓을 주문 ID 기준으로 그룹화
        const ticketGroups: { [key: string]: any[] } = {}

        // 티켓을 주문 ID 기준으로 그룹화
        tickets.forEach((ticket: any) => {
          const orderId = ticket.orderId || ticket.id
          if (!ticketGroups[orderId]) {
            ticketGroups[orderId] = []
          }
          ticketGroups[orderId].push(ticket)
        })

        // 그룹화된 티켓을 포맷팅
        const formattedTickets = Object.values(ticketGroups).map((ticketGroup) => {
          // 그룹의 첫 번째 티켓에서 공통 정보 추출
          const firstTicket = ticketGroup[0]
          console.log("티켓 그룹의 첫 번째 티켓:", firstTicket)
          console.log("orderId 값:", firstTicket.orderId || firstTicket.id)

          const screening = firstTicket.screening || {}
          const movie = screening.movie || {}
          const room = screening.room || {}
          const spot = room.spot || {}
          const region = spot.region || {}

          // 모든 좌석 정보 수집
          const seats = ticketGroup.map((ticket: any) => `${ticket.horizontal.toUpperCase()}${ticket.vertical}`)

          // 총 가격 계산
          const totalPrice = ticketGroup.reduce((sum: number, ticket: any) => sum + (ticket.price || 0), 0)

          return {
            id: firstTicket.id,
            movieTitle: movie.title || "제목 없음",
            theater: `${region.name} ${spot.name}점`,
            screen: `${room.roomnumber}관`,
            date: screening.date || "날짜 정보 없음",
            time: screening.start ? screening.start.substring(0, 5) : "시간 정보 없음",
            seats: seats,
            price: totalPrice,
            status: "confirmed", // 기본값은 confirmed
            orderId: firstTicket.orderId || firstTicket.id, // 취소 시 필요한 주문 ID
            posterImage: movie.posterImage || "",
          }
        })

        console.log("변환된 예매 내역:", formattedTickets)
        setBookingHistory(formattedTickets)
      } catch (error) {
        console.error("예매 내역 로드 오류:", error)
        setTicketsError(error instanceof Error ? error.message : "예매 내역을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setTicketsLoading(false)
      }
    }

    loadUserTickets()
  }, [user])

  const handleCancelOrder = async (orderId: number) => {
    console.log("취소 요청 시작 - 전달된 orderId:", orderId)
    console.log(
      "취소할 예매 정보:",
      bookingHistory.find((b) => b.orderId === orderId),
    )

    if (window.confirm("예매를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        setLoading(true)

        // cancelOrder 함수에 orderId 전달
        const result = await cancelOrder(orderId)
        console.log("예매 취소 결과:", result)

        // 성공 시 UI 업데이트 - 같은 주문 ID를 가진 모든 티켓 상태 업데이트
        const updatedHistory = bookingHistory.map((b) => (b.orderId === orderId ? { ...b, status: "canceled" } : b))
        setBookingHistory(updatedHistory)
        setSuccess("예매가 취소되었습니다.")
      } catch (error) {
        console.error("예매 취소 중 오류 발생:", error)
        setError(error instanceof Error ? error.message : "예매 취소 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">대시보드</CardTitle>
          <CardDescription>환영합니다, {user.username}님!</CardDescription>
        </CardHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setSuccess("") // 탭 변경 시 성공 메시지 초기화
            setError("") // 탭 변경 시 에러 메시지 초기화
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="tickets">예매</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 p-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profilePassword">현재 비밀번호 (변경 시 필요)</Label>
                <Input
                  id="profilePassword"
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">이름</Label>
                <div className="flex space-x-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                  <Button
                    onClick={() => handleUpdateProfile("username")}
                    disabled={loading || username === user.username || !profilePassword}
                    loading={loading}
                  >
                    변경
                  </Button>
                </div>
              </div>

              {/* 이메일 입력 부분 수정 (TabsContent value="profile" 내부) */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    disabled={verificationSuccess}
                  />
                  <Button
                    onClick={handleSendVerification}
                    disabled={loading || verificationLoading || verificationSuccess || newEmail === user.email}
                    loading={verificationLoading}
                  >
                    {verificationSent && !verificationSuccess ? "재전송" : "인증"}
                  </Button>
                </div>
              </div>

              {/* 인증 코드 입력 필드 (이메일 인증 코드 전송 후 표시) */}
              {verificationSent && !verificationSuccess && (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">인증 코드</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="인증 코드를 입력하세요"
                    />
                    <Button
                      onClick={handleVerifyCode}
                      disabled={loading || verificationLoading || !verificationCode}
                      loading={verificationLoading}
                    >
                      확인
                    </Button>
                  </div>
                </div>
              )}

              {/* 이메일 변경 버튼 */}
              {(verificationSuccess || user.email === newEmail) && (
                <Button
                  onClick={() => handleUpdateProfile("email")}
                  disabled={
                    loading ||
                    newEmail === user.email ||
                    !profilePassword ||
                    (!verificationSuccess && newEmail !== user.email)
                  }
                  loading={loading}
                  className="w-full"
                >
                  이메일 변경
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4 p-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* 내 영화관 지정 섹션 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />내 영화관 지정
                </h3>
                <div className="flex space-x-2">
                  <select
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedTheater}
                    onChange={(e) => setSelectedTheater(e.target.value)}
                  >
                    <option value="">영화관을 선택하세요</option>
                    {regionList.map((region) => (
                      <optgroup key={region.id} label={region.name}>
                        {theaterList
                          .filter((theater) => theater.region_id === region.id)
                          .map((theater) => (
                            <option key={theater.id} value={`${region.name} ${theater.name}점`}>
                              {region.name} {theater.name}점
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      // 내 영화관 저장 로직
                      setSuccess("내 영화관이 저장되었습니다.")
                      // 로컬 스토리지에도 저장
                      localStorage.setItem("preferredTheater", selectedTheater)
                      // 부모 컴포넌트에 알려 상태 업데이트
                      onUpdateUser("preferredTheater", selectedTheater)
                    }}
                    disabled={!selectedTheater || selectedTheater === user.preferredTheater}
                  >
                    저장
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  내 영화관으로 지정하면 예매 시 기본 영화관으로 설정됩니다.
                </p>
              </div>

              {/* 예매 내역 섹션 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  예매 내역
                </h3>

                {ticketsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : ticketsError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>{ticketsError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : bookingHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">예매 내역이 없습니다.</div>
                ) : (
                  <div className="space-y-4">
                    {bookingHistory.map((booking) => (
                      <Card key={booking.id} className={booking.status === "canceled" ? "opacity-60" : ""}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              {booking.posterImage && (
                                <img
                                  src={booking.posterImage || "/placeholder.svg"}
                                  alt={booking.movieTitle}
                                  className="w-16 h-24 object-cover rounded"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=96&width=64"
                                  }}
                                />
                              )}
                              <div>
                                <h4 className="font-bold text-base">{booking.movieTitle}</h4>
                                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                    {booking.date} {booking.time}
                                  </div>
                                  <div>
                                    {booking.theater} {booking.screen} | 좌석: {booking.seats.join(", ")}
                                  </div>
                                  <div className="font-medium text-foreground">{booking.price.toLocaleString()}원</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              {booking.status === "confirmed" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => {
                                    console.log("취소 버튼 클릭 - booking:", booking)
                                    console.log("취소 버튼 클릭 - orderId:", booking.orderId)
                                    handleCancelOrder(booking.orderId)
                                  }}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  예매 취소
                                </Button>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">취소됨</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 p-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <Button
                onClick={handleUpdatePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                loading={loading}
                className="w-full"
              >
                비밀번호 변경
              </Button>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600 mb-2">회원 탈퇴</h3>
              <p className="text-sm text-gray-500 mb-4">
                회원 탈퇴 시 모든 정보가 삭제되며, 이 작업은 되돌릴 수 없습니다.
              </p>

              {!showDeleteConfirm ? (
                <Button variant="destructive" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  회원 탈퇴
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">비밀번호 확인</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeletePassword("")
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDeleteAccount}
                      loading={loading}
                      disabled={!deletePassword || loading}
                    >
                      탈퇴 확인
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col space-y-2 pt-4">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full sm:flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="sm:inline">뒤로 가기</span>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:flex-1">
              <Link href="/" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                <span className="sm:inline">홈으로</span>
              </Link>
            </Button>
            <Button onClick={onLogout} variant="outline" className="w-full sm:flex-1">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="sm:inline">로그아웃</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
