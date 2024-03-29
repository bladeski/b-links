import { BlogPostModel, EventLogType, LinkModel } from '../models';

import ApiService from './ApiService';
import DOMPurify from 'dompurify';
import NotificationService from './NotificationService';
import { marked } from 'marked';

enum FormType {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

export default class ManagementService {
  private postTypeForm: HTMLFormElement | null;
  private postForm: HTMLFormElement | null;
  private linkForm: HTMLFormElement | null;
  private blogFormType: FormType = FormType.ADD;

  constructor() {
    this.postTypeForm = document.forms.namedItem('PostTypeForm');
    this.postTypeForm?.addEventListener(
      'change',
      this.onEditPostTypeForm.bind(this)
    );

    this.postForm = document.forms.namedItem('PostForm');
    this.postForm?.addEventListener('submit', this.onSubmitPostForm.bind(this));

    this.linkForm = document.forms.namedItem('LinkForm');
    this.linkForm?.addEventListener('submit', this.onSubmitLinkForm.bind(this));

    const postInput = this.postForm?.querySelector('textarea');
    postInput?.addEventListener('input', this.onUpdatePostInput.bind(this));

    ApiService.getBlogPosts().then(this.onGetBlogPosts.bind(this));
    ApiService.getLinks().then(this.onGetLinks.bind(this));
  }

  private onEditPostTypeForm(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectInput = this.postTypeForm?.querySelector(
      'select'
    ) as HTMLSelectElement;
    const idInput = this.postForm?.querySelector(
      'input[name="id"]'
    ) as HTMLInputElement;

    if (target.type === 'radio') {
      this.postForm?.reset();
      this.blogFormType =
        target.value === FormType.EDIT ? FormType.EDIT : FormType.ADD;
      switch (this.blogFormType) {
        case FormType.ADD:
          idInput.value = '';
          selectInput.disabled = true;
          break;
        case FormType.EDIT:
          selectInput.disabled = false;
          this.initialiseEditForm(selectInput.value);
          break;
        default:
          break;
      }
    } else if (target.tagName === 'SELECT') {
      this.initialiseEditForm(selectInput.value);
    }
  }

  private resetPostTypeForm() {
    this.postForm?.reset();
    const selectInput = this.postTypeForm?.querySelector(
      'select'
    ) as HTMLSelectElement;
    const idInput = this.postForm?.querySelector(
      'input[name="id"]'
    ) as HTMLInputElement;
    this.blogFormType = FormType.ADD;
    idInput.value = '';
    selectInput.disabled = true;
    ApiService.getBlogPosts().then(this.onGetBlogPosts.bind(this));
  }

  private onSubmitPostForm(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const id =
      this.blogFormType === FormType.EDIT
        ? formData.get('id')?.toString()
        : undefined;
    const post: BlogPostModel = {
      title: formData.get('title')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      post: formData.get('post')?.toString() || '',
      categories: formData.get('categories')?.toString().split(' ') || [],
      draft: !!formData.get('draft')
    };
    ApiService.addBlogPost(post, id).then(() => {
      NotificationService.showNotification({
        title: `${post.draft ? 'Draft ' : ''}Blog Post Saved`,
        description: `Successfully saved ${post.draft ? 'draft' : 'new'} blog post.`,
        type: EventLogType.SUCCESS,
        autoClose: true
      });

      this.postTypeForm?.reset();
      this.resetPostTypeForm();
      const preview = document.getElementById('PostPreview') as HTMLElement;
      preview.innerHTML = '';
      localStorage.removeItem('postDraft');
    }).catch(err => 
      NotificationService.showNotification({
        title: 'Problem Saving Blog Post',
        description: err.text,
        type: EventLogType.ERROR
      })
    );
  }

  private onSubmitLinkForm(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const link: LinkModel = {
      title: formData.get('title')?.toString() || '',
      url: formData.get('url')?.toString() || '',
      categories: formData.get('categories')?.toString().split(' ') || [],
    };
    ApiService.addLink(link).then(() => {
      NotificationService.showNotification({
        title: 'Link Saved',
        description: 'Successfully saved new link.',
        type: EventLogType.SUCCESS,
        autoClose: true
      });
      this.linkForm?.reset();
    }).catch(err => 
      NotificationService.showNotification({
        title: 'Problem Saving Link',
        description: err.text,
        type: EventLogType.ERROR
      })
    );
  }

  private onUpdatePostInput(event: Event) {
    this.updatePreview((event.target as HTMLTextAreaElement).value);
    const formData = new FormData((event.currentTarget as HTMLInputElement).form || undefined);
    const storageItem: BlogPostModel = {
      _id: FormType.EDIT
        ? formData.get('id')?.toString()
        : undefined,
      title: formData.get('title')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      post: (event.target as HTMLTextAreaElement).value,
      categories: formData.get('categories')?.toString().split(' ') || []
    }
    localStorage.setItem('postDraft', JSON.stringify(storageItem));
  }

  private updatePreview(text: string) {
    const preview = document.getElementById('PostPreview') as HTMLElement;
    const markdown = DOMPurify.sanitize(marked.parse(text));
    preview.innerHTML = `${markdown}`;
  }

  private onGetBlogPosts(posts: BlogPostModel[]) {
    const selectElement = this.postTypeForm?.querySelector('select');

    if (selectElement) {
      selectElement?.replaceChildren();
      posts.forEach((post) => {
        const option = document.createElement('option');
        option.value = post._id || '';
        option.text = `${post.draft ? 'DRAFT - ' : ''}${post.title}`;
        selectElement?.appendChild(option);
      });
    }
  }

  private onGetLinks(links: LinkModel[]) {
    const linksElement = document.querySelector('.links');

    if (linksElement) {
      const forms = links.map(link => {
        const linkForm = document.createElement('form');
        linkForm.id = `link_form${link._id}`;
        linkForm.onsubmit = (event) => {
          event.preventDefault();
          link._id && ApiService.deleteLink(link._id)
            .then(() => linkForm.remove());
        }

        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.textContent = link.title;

        linkForm.appendChild(anchor);

        const categories = document.createElement('ul');
        categories.className = 'link-categories';

        link.categories?.forEach(category => {
          const categoryEl = document.createElement('li');
          const detail = document.createElement('span');
          detail.className = 'category';
          detail.textContent = category;
          categoryEl.appendChild(detail);
          categories.appendChild(categoryEl);
        });

        linkForm.appendChild(categories);

        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = 'delete';
        button.disabled = !link._id;

        linkForm.appendChild(button);

        return linkForm;
      });
      forms.forEach(form => linksElement.appendChild(form));
    }
  }

  private async initialiseEditForm(id: string) {
    const selectedPost = await ApiService.getBlogPost(id);
    //this.blogPosts.find((post) => post._id === id);

    if (selectedPost) {
      const titleInput = this.postForm?.querySelector(
        'input[name="title"]'
      ) as HTMLInputElement;
      const descriptionInput = this.postForm?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const contentInput = this.postForm?.querySelector(
        'textarea[name="post"]'
      ) as HTMLInputElement;
      const categoriesInput = this.postForm?.querySelector(
        'input[name="categories"]'
      ) as HTMLInputElement;
      const idInput = this.postForm?.querySelector(
        'input[name="id"]'
      ) as HTMLInputElement;
      const saveDraftInput = this.postForm?.querySelector(
        'input[name="draft"]'
      ) as HTMLInputElement;

      titleInput.value = selectedPost.title;
      descriptionInput.value = selectedPost.description;
      contentInput.value = selectedPost.post;
      categoriesInput.value = selectedPost.categories.join(' ');
      idInput.value = selectedPost._id || '';
      saveDraftInput.checked = selectedPost.draft || false;

      this.updatePreview(selectedPost.post);
    }
  }
}
