// 辅助函数：计算中位数 (新增)
  const calculateMedian = (values: number[]) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Index Calculation Logic (Optimized)
  const indexData = useMemo(() => {
    // 1. 筛选数据
    const filtered = artworks.filter(a => 
      (selectedCategory === 'all' || a.category === selectedCategory) &&
      (selectedYear === 'all' || a.auctionDate.startsWith(selectedYear))
    );

    // 2. 按月分组
    const monthlyGroups: Record<string, Artwork[]> = {};
    filtered.forEach(art => {
      const month = art.auctionDate.substring(0, 7); // YYYY-MM
      if (!monthlyGroups[month]) monthlyGroups[month] = [];
      monthlyGroups[month].push(art);
    });

    const months = Object.keys(monthlyGroups).sort();
    if (months.length === 0) return [];

    // 3. 计算每个月的基础数据 (均价改用中位数)
    const monthlyStats = months.map(m => {
      const arts = monthlyGroups[m];
      const prices = arts.map(a => a.hammerPrice);
      // 优化：使用中位数价格，抗干扰
      const medianPrice = calculateMedian(prices);
      return {
        date: m,
        volume: arts.length,
        price: medianPrice,
        arts
      };
    });

    // 4. 设定基准 (Base)
    // 优化：以筛选范围内的【第一个月】作为基准点 (Base = 1000)
    // 这样曲线总是从 1000 开始，直观展示这段时间内的变化
    const baseStats = monthlyStats[0];
    // 防止除以零
    const basePrice = baseStats.price || 1; 
    const baseVolume = baseStats.volume || 1;

    // 5. 生成最终指数
    return monthlyStats.map(stat => {
      // 价格指数：当前中位数 / 基准中位数
      const priceRatio = stat.price / basePrice;
      
      // 交易量指数：当前量 / 基准量
      const volumeRatio = stat.volume / baseVolume;
      
      // 综合指数算法：价格权重 70%，成交量权重 30% (调整了权重，更看重价格)
      // 并标准化为 1000 点起步
      let indexValue = Math.round((priceRatio * 0.7 + volumeRatio * 0.3) * 1000);

      // 异常处理：如果没有成交，保持上个月的指数或设为0
      if (stat.volume === 0) indexValue = 0;

      return { 
        date: stat.date, 
        value: indexValue, 
        volume: stat.volume, 
        avgPrice: stat.price // 显示中位数价格
      } as IndexPoint;
    });
  }, [artworks, selectedCategory, selectedYear]);
