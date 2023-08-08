new Vue({
    el: '#app',
    data() {
        return {
            showResult: false,
            showImage: false,
            url: '',
            html: '',
            markdown: '',
            bbcode: '',
            copyText: '复制',
        };
    },
    computed: {
        items() {
            return [
                { label: 'URL', value: this.url },
                { label: 'HTML', value: this.html },
                { label: 'Markdown', value: this.markdown },
                { label: 'BBCode', value: this.bbcode }
            ];
        },
    },
    methods: {
        copyItem(item) {
            this.copyToClipboard(item.value);
        },

        copyToClipboard(text) {
            const input = document.createElement('textarea');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            layui.layer.msg('复制成功！', { icon: 1 });
        }
    },
    mounted() {
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'never';
        const head = document.querySelector('head');
        head.appendChild(meta);

        const $multiple = $('#multiple');
        const $fileInput = $('#xf-file');

        $multiple.on('click', () => { $fileInput.click(); });

        $fileInput.change(e => {
            let file = e.target.files[0];
            if (!file) {
                layui.layer.msg('请选择需要上传的文件', { icon: 1 });
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            axios.post('https://api.xfyun.club/huluxiaUpload.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(response => {
                    const url = response.data.url;
                    const newUrl = url.replace('http://', 'https://');
                    if (newUrl) {
                        $('#img-thumb img').attr('src', newUrl);
                        $('.bigPic').attr('data-pic', newUrl);
                        this.showImage = true;
                        this.url = newUrl;
                        this.markdown = `![Image](${newUrl})`;
                        this.html = `<img src="${newUrl}" alt="">`;
                        this.bbcode = `[img]${newUrl}[/img]`;
                        this.showResult = true;
                        layui.layer.msg('图片上传成功!', { icon: 1 });
                    } else {
                        layui.layer.msg('上传图片失败!', { icon: 2 });
                    }
                })
                .catch(error => {
                    if (error.response) {
                        layui.layer.msg(`服务器返回的状态代码 ${error.response.status}.`, { icon: 2 });
                    } else if (error.request) {
                        layui.layer.msg('未收到来自服务器的响应！', { icon: 2 });
                    } else {
                        layui.layer.msg('发送请求时出错！', { icon: 2 });
                    }
                });
        });
    }
});