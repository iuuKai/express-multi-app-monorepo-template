$(function () {
	// 过滤函数：结合标签筛选和搜索筛选
	function filterCards() {
		const selectedType = $('.tag.active').data('type')
		const searchText = $('.search-input').val().toLowerCase().trim()

		$('.card').each(function () {
			const cardType = $(this).data('type')
			const cardTitle = $(this).find('.card-title').text().toLowerCase()
			const cardDesc = $(this).find('.card-desc').text().toLowerCase()

			const matchType = selectedType === '全部' || cardType === selectedType
			const matchSearch =
				searchText === '' || cardTitle.includes(searchText) || cardDesc.includes(searchText)

			if (matchType && matchSearch) {
				$(this).show()
			} else {
				$(this).hide()
			}
		})
	}

	// 标签点击事件
	$('.tag').click(function () {
		$(this).addClass('active').siblings().removeClass('active')
		filterCards()
	})

	// 搜索框输入事件
	$('.search-input').on('input', filterCards)

	// 滚动到顶部按钮
	const scrollTopBtn = $('#scrollTopBtn')

	// 检查滚动位置并显示/隐藏按钮
	function checkScroll() {
		if ($(window).scrollTop() > 300) {
			scrollTopBtn.addClass('visible')
		} else {
			scrollTopBtn.removeClass('visible')
		}
	}

	// 监听滚动和窗口 resize 事件
	$(window).on('scroll resize', checkScroll)

	// 页面加载时检查滚动位置（解决刷新页面时按钮不显示的问题）
	checkScroll()

	// 点击滚动到顶部
	scrollTopBtn.click(function () {
		$('html, body').animate(
			{
				scrollTop: 0
			},
			400
		)
	})
})
