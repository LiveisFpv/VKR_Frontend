export interface TokenResReq {
  access_token: string
}

export interface UserLoginRequest {
  login: string
  password: string
}

export interface UserRegisterRequest {
  email: string
  first_name: string
  last_name: string
  password: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  message?: string
}

export interface UserResponse {
  id?: number
  email: string
  email_confirmed: boolean
  first_name: string
  last_name: string
  locale_type?: string
  photo?: string
  roles: string[]
}

export interface User {
  id?: number
  email: string
  email_confirmed: boolean
  first_name: string
  last_name: string
  locale_type?: string
  photo?: string
  roles: string[]
}

export interface ErrorResponse {
  error: string
}

export interface UserUpdateRequest {
  email?: string
  first_name?: string
  last_name?: string
  locale_type?: string
  password?: string
}

export interface UserUpdateRequestWithRoles {
  email?: string
  first_name?: string
  last_name?: string
  locale_type?: string
  password?: string
  roles?: string[]
}

// Admin: list users response
export interface UserListResponse {
  items: UserResponse[]
  limit: number
  page: number
  total: number
}

// Admin: list users query
export interface UserListQuery {
  q?: string
  role?: string
  email_confirmed?: boolean
  locale?: string
  page?: number
  limit?: number
}

export interface PapersResponse {
  papers?: PaperResponse[]
}

export interface PaperResponse {
  abstract?: string
  best_oa_location?: string
  id?: string
  title?: string
  year?: number
}

export interface AddPaperRequest {
  abstract?: string
  best_oa_location?: string
  id?: string
  referenced_paper?: ReferencedPaper[]
  related_paper?: RelatedPaper[]
  title?: string
  year?: number
}

export interface RelatedPaper {
  id?: string
}

export interface ReferencedPaper {
  id?: string
}
