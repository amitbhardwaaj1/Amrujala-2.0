import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { NewspaperId } from "@/data/newspapers";

interface DownloadState {
  isLoading: boolean;
  pages: string[];
  progress: number;
  totalPages: number;
  city: string;
  date: string;
  newspaper: NewspaperId;
}

// API endpoints for each newspaper (proxied through backend to avoid CORS blocks)
const API_ENDPOINTS = {
  "amar-ujala": "/api/download/amar-ujala",
  "dainik-jagran": "/api/download/dainik-jagran",
  "hindustan-times": "/api/download/hindustan-times",
  "times-of-india": "/api/download/times-of-india",
  "hindustan": "/api/download/hindustan",
};

/**
 * Robust fetch utility that retries failed requests with progressive backoff.
 * Also checks that the returned JSON contains the actual htmlContent to prevent empty page displays.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delayMs: number = 300
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error status ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.data || !data.data.htmlContent) {
        throw new Error("Missing HTML content payload in API response");
      }
      return data;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      // Progressive delay to let the upstream server cool down
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

/**
 * Runs tasks in controlled-size batches to prevent overwhelming the server with high-concurrency requests
 */
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export function useEpaperDownload() {
  const [state, setState] = useState<DownloadState>({
    isLoading: false,
    pages: [],
    progress: 0,
    totalPages: 0,
    city: "",
    date: "",
    newspaper: "amar-ujala",
  });

  const download = useCallback(
    async (
      newspaper: NewspaperId,
      city: string,
      date: string,
      paperType?: string,
      stateId?: string,
      subCity?: string
    ) => {
      setState({ isLoading: true, pages: [], progress: 0, totalPages: 0, city, date, newspaper });

      const [year, month, day] = date.split("-");

      try {
        let images: string[] = [];
        let totalPage = 1;

        if (newspaper === "amar-ujala") {
          // Amar Ujala - POST with pagination (using retry helper for the first page)
          const firstData = await fetchWithRetry(API_ENDPOINTS["amar-ujala"], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, month, day, city, type: paperType || "main", page: "01" }),
          }, 3, 400);

          totalPage = parseInt(firstData.data.totalPage, 10) || 1;
          images.push(firstData.data.htmlContent);
          setState((s) => ({ ...s, progress: 1, totalPages: totalPage }));

          // Process subsequent pages in groups of 4 to keep download fast yet 100% reliable
          const pageIndices = Array.from({ length: totalPage - 1 }, (_, index) => index + 2);
          let completedCount = 1;

          const pageResults = await processInBatches(pageIndices, 4, async (i) => {
            try {
              const pageNumber = i.toString().padStart(2, "0");
              const pageData = await fetchWithRetry(API_ENDPOINTS["amar-ujala"], {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year, month, day, city, type: paperType || "main", page: pageNumber }),
              }, 3, 300);

              completedCount++;
              setState((s) => ({ ...s, progress: completedCount }));

              return { pageIndex: i, htmlContent: pageData.data.htmlContent };
            } catch (err) {
              console.error(`Amar Ujala page ${i} fetch error (permanently failed after retries):`, err);
              completedCount++;
              setState((s) => ({ ...s, progress: completedCount }));
              return { 
                pageIndex: i, 
                htmlContent: `<div style="padding: 60px 40px; text-align: center; color: #f43f5e; background-color: #0c0f1d; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(244, 63, 94, 0.2);" class="glass-accent-card">
                  <h4 className="text-lg font-bold mb-2">Page ${i} Unavailable</h4>
                  <p className="text-sm text-slate-400">The server timed out or failed to return this page. Please try refreshing again as this happens due to temporary high traffic demand.</p>
                </div>` 
              };
            }
          });

          // Sort by original page index to preserve the sequential page order
          pageResults.sort((a, b) => a.pageIndex - b.pageIndex);
          pageResults.forEach((res) => {
            images.push(res.htmlContent);
          });
        } else if (newspaper === "dainik-jagran") {
          // Dainik Jagran - GET, single response (all pages in one HTML)
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthName = months[parseInt(month) - 1];

          const response = await fetch(
            `${API_ENDPOINTS["dainik-jagran"]}?citySlug=${city}&day=${day}&month=${monthName}&year=${year}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          const data = await response.json();

          if (data?.data?.htmlContent) {
            // Parse the HTML to extract individual page images
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = data.data.htmlContent;
            const pageImages = tempDiv.querySelectorAll("img");

            if (pageImages.length > 0) {
              pageImages.forEach((img, idx) => {
                images.push(`<img src="${img.src}" alt="Page ${idx + 1}" style="width:100%;" />`);
              });
              totalPage = images.length;
            } else {
              images.push(data.data.htmlContent);
              totalPage = 1;
            }
          } else {
            throw new Error("No data returned from the API.");
          }
          setState((s) => ({ ...s, progress: totalPage, totalPages: totalPage }));
        } else if (newspaper === "hindustan-times") {
          // Hindustan Times - GET, single response with formatted date
          const formattedDate = `${day}/${month}/${year}`;
          const editionId = subCity || city;

          const response = await fetch(
            `${API_ENDPOINTS["hindustan-times"]}?editionId=${editionId}&editionDate=${formattedDate}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          const data = await response.json();

          if (data?.data?.htmlContent) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = data.data.htmlContent;
            const pageImages = tempDiv.querySelectorAll("img");

            if (pageImages.length > 0) {
              pageImages.forEach((img, idx) => {
                images.push(`<img src="${img.src}" alt="Page ${idx + 1}" style="width:100%;" />`);
              });
              totalPage = images.length;
            } else {
              images.push(data.data.htmlContent);
              totalPage = 1;
            }
          } else {
            throw new Error("No data returned from the API.");
          }
          setState((s) => ({ ...s, progress: totalPage, totalPages: totalPage }));
        } else if (newspaper === "times-of-india") {
          // Times of India - GET with pagination
          const firstData = await fetchWithRetry(
            `${API_ENDPOINTS["times-of-india"]}?citySlug=${city}&day=${day}&month=${month}&year=${year}&page=1`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
            3,
            400
          );

          totalPage = parseInt(firstData.data.totalPage, 10);
          images.push(firstData.data.htmlContent);
          setState((s) => ({ ...s, progress: 1, totalPages: totalPage }));

          // Process subsequent TOI page fetches in batches of 4 for massive speedup without failure rate
          const pageIndices = Array.from({ length: totalPage - 1 }, (_, index) => index + 2);
          let completedCount = 1;

          const pageResults = await processInBatches(pageIndices, 4, async (i) => {
            try {
              const pageData = await fetchWithRetry(
                `${API_ENDPOINTS["times-of-india"]}?citySlug=${city}&day=${day}&month=${month}&year=${year}&page=${i}`,
                { method: "GET", headers: { "Content-Type": "application/json" } },
                3,
                300
              );

              completedCount++;
              setState((s) => ({ ...s, progress: completedCount }));

              return { pageIndex: i, htmlContent: pageData.data.htmlContent };
            } catch (err) {
              console.error(`Times of India page ${i} fetch error after retries:`, err);
              completedCount++;
              setState((s) => ({ ...s, progress: completedCount }));
              return { 
                pageIndex: i, 
                htmlContent: `<div style="padding: 60px 40px; text-align: center; color: #f43f5e; background-color: #0c0f1d; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(244, 63, 94, 0.2);" class="glass-accent-card">
                  <h4 className="text-lg font-bold mb-2">Page ${i} Unavailable</h4>
                  <p className="text-sm text-slate-400">The server timed out or failed to return this page. Please try refreshing again as this happens due to temporary high traffic demand.</p>
                </div>` 
              };
            }
          });

          // Sort by original page index to preserve sequence order
          pageResults.sort((a, b) => a.pageIndex - b.pageIndex);
          pageResults.forEach((res) => {
            images.push(res.htmlContent);
          });
        } else if (newspaper === "hindustan") {
          // Hindustan - GET, single response with formatted date
          const formattedDate = `${day}/${month}/${year}`;

          const response = await fetch(
            `${API_ENDPOINTS["hindustan"]}?editionId=${city}&editionDate=${formattedDate}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          const data = await response.json();

          if (data?.data?.htmlContent) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = data.data.htmlContent;
            const pageImages = tempDiv.querySelectorAll("img");

            if (pageImages.length > 0) {
              pageImages.forEach((img, idx) => {
                images.push(`<img src="${img.src}" alt="Page ${idx + 1}" style="width:100%;" />`);
              });
              totalPage = images.length;
            } else {
              images.push(data.data.htmlContent);
              totalPage = 1;
            }
          } else {
            throw new Error("No data returned from the API.");
          }
          setState((s) => ({ ...s, progress: totalPage, totalPages: totalPage }));
        }

        setState({ isLoading: false, pages: images, progress: totalPage, totalPages: totalPage, city, date, newspaper });
      } catch (error) {
        console.error("Download error:", error);
        setState({ isLoading: false, pages: [], progress: 0, totalPages: 0, city: "", date: "", newspaper: "amar-ujala" });

        toast({
          title: "Download Failed",
          description: "Please check your internet connection or try a different date/city.",
          variant: "destructive",
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, pages: [], progress: 0, totalPages: 0, city: "", date: "", newspaper: "amar-ujala" });
  }, []);

  return {
    ...state,
    download,
    reset,
  };
}
