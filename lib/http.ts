type CustomOptions = RequestInit & {
    baseUrl?: string | undefined
}
const request = async <Response>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options?: CustomOptions | undefined) => {
    const response = await fetch(url, {
      method,
      headers: options?.headers,
      body: options?.body ? JSON.stringify(options.body) : undefined, 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    const payload: Response = await response.json()
    const data = {
        status: response.status,
        payload
    }
    return { ...data }
  }
const http = {
    get<Response>(url: string, options?: Omit<CustomOptions, 'body'> | undefined) {
        return request<Response>('GET', url, options)
    },
    post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'> | undefined) {
        return request<Response>('POST', url, { ...options, body })
    },
    put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'> | undefined) {
        return request<Response>('PUT', url, { ...options, body })
    },
    delete<Response>(url: string, options?: Omit<CustomOptions, 'body'> | undefined) {
        return request<Response>('DELETE', url, { ...options })
    },
    remove<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'> | undefined) {
        return request<Response>('DELETE', url, { ...options, body })
    }
}

export default http