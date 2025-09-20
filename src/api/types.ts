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

export interface UserResponse {
  email: string
  email_confirmed: boolean
  first_name: string
  last_name: string
  locale_type?: string
  photo?: string
  roles: string[]
}

export interface User {
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
