package com.example.demo.utility;


import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum Role {

    SUPER_ADMIN(EnumSet.allOf(Permission.class)),

    ADMIN(Set.of(
            Permission.USER_READ,
            Permission.USER_CREATE,
            Permission.USER_UPDATE,
            Permission.USER_DELETE,

            Permission.CATEGORY_READ,
            Permission.CATEGORY_CREATE,
            Permission.CATEGORY_UPDATE,
            Permission.CATEGORY_DELETE,

            Permission.TAG_READ,
            Permission.TAG_CREATE,
            Permission.TAG_UPDATE,
            Permission.TAG_DELETE,

            Permission.POST_READ,
            Permission.POST_READ_ALL,
            Permission.POST_CREATE,
            Permission.POST_UPDATE_ANY,
            Permission.POST_DELETE_ANY,
            Permission.POST_APPROVE,
            Permission.POST_REJECT,
            Permission.POST_PUBLISH,
            Permission.POST_UNPUBLISH,

            Permission.COMMENT_READ,
            Permission.COMMENT_CREATE,
            Permission.COMMENT_UPDATE_ANY,
            Permission.COMMENT_DELETE_ANY,
            Permission.COMMENT_MODERATE,

            Permission.CONTENT_SEARCH,
            Permission.PROFILE_UPDATE_ANY
    )),

    EDITOR(Set.of(
            Permission.POST_READ,
            Permission.POST_READ_ALL,
            Permission.POST_CREATE,
            Permission.POST_UPDATE_ANY,
            Permission.POST_APPROVE,
            Permission.POST_REJECT,

            Permission.COMMENT_READ,
            Permission.COMMENT_MODERATE,

            Permission.CATEGORY_READ,
            Permission.CATEGORY_CREATE,
            Permission.CATEGORY_UPDATE,

            Permission.TAG_READ,
            Permission.TAG_CREATE,
            Permission.TAG_UPDATE,

            Permission.CONTENT_SEARCH
    )),

    AUTHOR(Set.of(
            Permission.POST_READ,
            Permission.POST_READ_OWN_DRAFTS,
            Permission.POST_CREATE,
            Permission.POST_UPDATE_OWN,
            Permission.POST_DELETE_OWN,
            Permission.POST_SUBMIT_DRAFT,

            Permission.COMMENT_READ,
            Permission.CONTENT_SEARCH
    )),

    READER(Set.of(
            Permission.POST_READ,
            Permission.COMMENT_READ,
            Permission.COMMENT_CREATE,
            Permission.POST_LIKE,
            Permission.PROFILE_UPDATE_OWN,
            Permission.CONTENT_SEARCH
    )),

    GUEST(Set.of(
            Permission.POST_READ,
            Permission.COMMENT_READ,
            Permission.CONTENT_SEARCH
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = Collections.unmodifiableSet(permissions);
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }
}