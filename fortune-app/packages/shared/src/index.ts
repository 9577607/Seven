export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const DISCLAIMER = '本内容仅供娱乐与参考，请理性看待。';
