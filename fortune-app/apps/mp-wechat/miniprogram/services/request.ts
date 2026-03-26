export const request = <T>(url: string, method: WechatMiniprogram.RequestOption['method'], data?: unknown) =>
  new Promise<T>((resolve, reject) => {
    wx.request({ url, method, data, success: (res) => resolve(res.data as T), fail: reject });
  });
