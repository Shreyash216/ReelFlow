# ReelFlow Privacy Policy

**Last updated:** 11 November 2026

ReelFlow is a Firefox extension that changes how Instagram Web responds
to browser visibility changes so that Reels audio can continue when you
switch tabs or minimize Firefox.

This policy explains what the extension accesses and stores.

## 1. Information ReelFlow stores

ReelFlow uses Firefox's `browser.storage.local` extension storage for
the following settings and diagnostics:

  -----------------------------------------------------------------------
  Item                                Purpose
  ----------------------------------- -----------------------------------
  `enabled`                           Stores whether background playback
                                      is enabled.

  `lastError`                         Stores the most recent diagnostic
                                      error message and its timestamp,
                                      when an error is reported.
  -----------------------------------------------------------------------

These values are stored locally by Firefox for the extension. ReelFlow's
current implementation does not send them to a ReelFlow-operated server.

## 2. Information ReelFlow accesses

When you visit an Instagram page, ReelFlow's content scripts run on that
page. They interact with the page's visibility-related browser
properties and visibility-change events to enable or disable the
background-playback behaviour.

ReelFlow does not ask for or collect your Instagram password, login
credentials, direct messages, contacts, or payment information. It does
not intentionally collect the content of your Reels or your browsing
history.

Instagram itself may collect and process information under Meta's own
privacy terms when you use Instagram. ReelFlow is an independent browser
extension and does not control Meta's data practices.

## 3. Data sharing and transmission

The current ReelFlow implementation does not include: - An external
ReelFlow application server. - Third-party analytics or advertising
services. - A feature that uploads the extension's stored settings or
diagnostic records.

The extension uses messages between its own content scripts to
coordinate settings and playback behaviour within the Instagram page.
Those messages are not a remote data-transfer service.

## 4. Permissions

ReelFlow requests the Firefox `storage` permission to save the user's
playback preference and local diagnostic information.

Its content scripts are configured to run on Instagram domains
(`*.instagram.com`) because the extension's functionality is limited to
Instagram Web.

## 5. Data retention and control

The playback preference and any stored diagnostic record remain in
Firefox's local extension storage until they are changed or cleared, or
Firefox otherwise removes the extension's stored data. You can disable
ReelFlow's functionality using its popup control. You can also remove
the extension through Firefox's add-on manager.

## 6. Children's privacy

ReelFlow is a general-purpose browser extension and is not designed to
collect personal information from children.

## 7. Changes to this policy

This policy may be updated if ReelFlow's functionality, permissions,
storage, or data practices change. The latest version will be published
in the project's GitHub repository.

## 8. Contact

For privacy questions or concerns, please open an issue in the ReelFlow
GitHub repository:

https://github.com/Shreyash216/ReelFlow/issues

------------------------------------------------------------------------

ReelFlow is an independent project and is not affiliated with, endorsed
by, or sponsored by Instagram or Meta.
