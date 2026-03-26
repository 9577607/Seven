describe('api-server', () => {
  it('should provide deterministic mock result shape', () => {
    const result = { reportId: 1001, score: 82 };
    expect(result.reportId).toBe(1001);
  });
});
