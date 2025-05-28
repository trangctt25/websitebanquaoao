using System.Collections.Generic;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }      // Tổng số bản ghi
    public int PageIndex { get; set; }        // Trang hiện tại
    public int PageSize { get; set; }         // Kích thước trang
}